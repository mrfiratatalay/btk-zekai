import { commit, daysAgo, newId, type DemoBundle, type DemoDb, type DemoOrder, type DemoOrderItem } from "./db";
import {
  bundleProducts, bundlePricing, buildCartItem, findProduct, isPublicBundleVisible, primaryImage, unitDiscount,
} from "./domain";
import { badRequest, body, created, currentUser, noContent, notFound, ok, type DemoRequest, type DemoResult } from "./http";

function cartOf(db: DemoDb, userId: string) {
  db.carts[userId] ??= { id: newId(), items: [] };
  return db.carts[userId];
}

function sortedCart(db: DemoDb, userId: string) {
  const cart = cartOf(db, userId);
  return { id: cart.id, items: [...cart.items].sort((a, b) => (a.bundleId ?? a.productId).localeCompare(b.bundleId ?? b.productId)) };
}

function publishedBundle(db: DemoDb, bundleId: string): DemoBundle {
  const bundle = db.bundles.find((b) => b.id === bundleId && b.status === 1);
  if (!bundle || !isPublicBundleVisible(db, bundle)) notFound("Paket bulunamadı.");
  return bundle;
}

/** A bundle sits in the cart as two linked lines; both always share one quantity. */
function upsertBundle(db: DemoDb, userId: string, bundle: DemoBundle, quantity: number) {
  const [primary, extra] = bundleProducts(db, bundle);
  if (primary.stock < quantity || extra.stock < quantity) badRequest("Paket için yeterli stok yok.");
  const { originalTotal, discountAmount } = bundlePricing(primary, extra, bundle.discountPercent);
  const cart = cartOf(db, userId);
  for (const product of [primary, extra]) {
    const discount = unitDiscount(product, originalTotal, discountAmount);
    const line = cart.items.find((i) => i.bundleId === bundle.id && i.productId === product.id);
    if (line) Object.assign(line, { quantity: Math.min(quantity, product.stock), price: product.price - discount, discountAmount: discount });
    else cart.items.push(buildCartItem(db, product, quantity, bundle, discount));
  }
  return cart.items.filter((i) => i.bundleId === bundle.id);
}

function cartRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const db = req.db;
  const cart = cartOf(db, userId);
  const qty = (fallback: number) => Math.round(Number(body<{ quantity: number }>(req).quantity ?? fallback));
  if (req.path === "/api/buyer/cart" && req.method === "GET") return ok(sortedCart(db, userId));
  if (req.path === "/api/buyer/cart" && req.method === "DELETE") { cart.items = []; commit(db); return noContent(); }
  if (req.path === "/api/buyer/cart/items" && req.method === "POST") {
    const productId = body<{ productId: string }>(req).productId ?? "";
    const product = findProduct(db, productId);
    if (product.stock <= 0) badRequest("Ürün stokta yok.");
    const line = cart.items.find((i) => i.productId === productId && !i.bundleId);
    if (line) line.quantity = Math.min(line.quantity + Math.max(1, qty(1)), product.stock);
    else cart.items.push(buildCartItem(db, product, Math.max(1, qty(1))));
    commit(db);
    return ok(cart.items.find((i) => i.productId === productId && !i.bundleId));
  }
  const item = req.path.match(/^\/api\/buyer\/cart\/items\/(\d+)$/);
  if (item) {
    const line = cart.items.find((i) => i.id === Number(item[1])) ?? notFound("Sepet öğesi bulunamadı.");
    if (req.method === "DELETE") {
      cart.items = cart.items.filter((i) => (line.bundleId ? i.bundleId !== line.bundleId : i.id !== line.id));
    } else if (req.method === "PUT") {
      if (line.bundleId) badRequest("Paket ürünleri paket olarak güncellenmelidir.");
      if (qty(0) <= 0) cart.items = cart.items.filter((i) => i.id !== line.id);
      else line.quantity = Math.min(qty(0), line.stock);
    } else return null;
    commit(db);
    return req.method === "DELETE" ? noContent() : ok(line);
  }
  const bundle = req.path.match(/^\/api\/buyer\/cart\/bundles\/([^/]+)$/);
  if (!bundle) return null;
  const lines = cart.items.filter((i) => i.bundleId === bundle[1]);
  if (req.method === "POST") {
    const current = lines.reduce((max, i) => Math.max(max, i.quantity), 0);
    const result = upsertBundle(db, userId, publishedBundle(db, bundle[1]), current + Math.max(1, qty(1)));
    commit(db);
    return ok(result);
  }
  if (lines.length === 0) notFound("Paket sepette bulunamadı.");
  if (req.method === "DELETE" || (req.method === "PUT" && qty(0) <= 0)) {
    cart.items = cart.items.filter((i) => i.bundleId !== bundle[1]);
    commit(db);
    return req.method === "DELETE" ? noContent() : ok([]);
  }
  if (req.method !== "PUT") return null;
  const result = upsertBundle(db, userId, publishedBundle(db, bundle[1]), qty(0));
  commit(db);
  return ok(result);
}

function imageOf(db: DemoDb, productId: string): string {
  const product = db.products.find((p) => p.id === productId);
  return product ? primaryImage(product) : "";
}

function toOrderDto(db: DemoDb, order: DemoOrder) {
  const { buyerId: _buyerId, items, ...rest } = order;
  return { ...rest, items: items.map((i) => ({ ...i, image: imageOf(db, i.productId) })) };
}

/** Prices always come from the catalogue, never from the request, exactly like BuyerService. */
function createOrder(req: DemoRequest, userId: string): DemoResult {
  const input = body<{ items: { productId: string; quantity: number }[]; bundles: { bundleId: string; quantity: number }[]; deliveryAddress: string; paymentMethod: string }>(req);
  if (!input.deliveryAddress?.trim()) badRequest("Teslimat adresi gerekli.");
  const db = req.db;
  const order: DemoOrder = {
    id: newId(), orderNumber: `ZK-${Math.floor(Date.now() / 1000)}`, buyerId: userId, subtotal: 0, discountTotal: 0, total: 0,
    status: "Pending", deliveryAddress: input.deliveryAddress.trim(), paymentMethod: input.paymentMethod ?? "Kredi Kartı",
    orderedAt: new Date().toISOString(), deliveredAt: null, items: [],
  };
  const line = (p: ReturnType<typeof findProduct>, quantity: number, bundle: DemoBundle | null, discount: number): DemoOrderItem => ({
    productId: p.id, title: p.title, sellerName: p.sellerName, bundleId: bundle?.id ?? null, bundleTitle: bundle?.title ?? null,
    originalUnitPrice: p.price, discountAmount: discount, price: p.price - discount, quantity,
  });
  for (const { productId, quantity } of (input.items ?? []).filter((i) => i.quantity > 0)) {
    const product = findProduct(db, productId);
    if (product.stock < quantity) badRequest("Yeterli stok yok.");
    product.stock -= quantity;
    order.subtotal += product.price * quantity;
    order.total += product.price * quantity;
    order.items.push(line(product, quantity, null, 0));
  }
  for (const { bundleId, quantity } of (input.bundles ?? []).filter((b) => b.quantity > 0)) {
    const bundle = publishedBundle(db, bundleId);
    const [primary, extra] = bundleProducts(db, bundle);
    if (primary.stock < quantity || extra.stock < quantity) badRequest("Paket için yeterli stok yok.");
    const { originalTotal, discountAmount } = bundlePricing(primary, extra, bundle.discountPercent);
    for (const product of [primary, extra]) {
      const discount = unitDiscount(product, originalTotal, discountAmount);
      product.stock -= quantity;
      order.subtotal += product.price * quantity;
      order.discountTotal += discount * quantity;
      order.total += (product.price - discount) * quantity;
      order.items.push(line(product, quantity, bundle, discount));
    }
  }
  if (order.items.length === 0) badRequest("Sipariş için ürün gerekli.");
  db.orders.push(order);
  commit(db);
  return created(toOrderDto(db, order));
}

function orderRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const db = req.db;
  if (req.path === "/api/buyer/orders" && req.method === "GET") {
    return ok(db.orders.filter((o) => o.buyerId === userId).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)).map((o) => toOrderDto(db, o)));
  }
  if (req.path === "/api/buyer/orders" && req.method === "POST") return createOrder(req, userId);
  const match = req.path.match(/^\/api\/buyer\/orders\/([^/]+?)(\/mark-delivered)?$/);
  if (!match) return null;
  const order = db.orders.find((o) => o.id === match[1] && o.buyerId === userId) ?? notFound("Sipariş bulunamadı.");
  if (!match[2] && req.method === "GET") return ok(toOrderDto(db, order));
  if (match[2] && req.method === "POST") {
    if (order.status !== "Pending") badRequest("Yalnızca bekleyen siparişler teslim alınabilir.");
    order.status = "Delivered";
    order.deliveredAt = new Date().toISOString();
    commit(db);
    return ok(toOrderDto(db, order));
  }
  return null;
}

function favoriteRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const db = req.db;
  if (req.path === "/api/buyer/favorites" && req.method === "GET") {
    return ok(db.favorites
      .filter((f) => f.userId === userId && db.products.some((p) => p.id === f.productId))
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .map((f) => {
        const p = findProduct(db, f.productId);
        return { productId: p.id, title: p.title, price: p.price, image: primaryImage(p), addedAt: f.addedAt };
      }));
  }
  const match = req.path.match(/^\/api\/buyer\/favorites\/([^/]+)$/);
  if (!match) return null;
  const productId = decodeURIComponent(match[1]);
  if (req.method === "POST") {
    findProduct(db, productId);
    if (!db.favorites.some((f) => f.userId === userId && f.productId === productId)) {
      db.favorites.push({ userId, productId, addedAt: daysAgo(0, new Date().getHours()) });
    }
  } else if (req.method === "DELETE") {
    db.favorites = db.favorites.filter((f) => !(f.userId === userId && f.productId === productId));
  } else return null;
  commit(db);
  return noContent();
}

export function buyerRoutes(req: DemoRequest): DemoResult | null {
  if (!req.path.startsWith("/api/buyer/")) return null;
  const user = currentUser(req, "Buyer");
  if (req.path.startsWith("/api/buyer/cart")) return cartRoutes(req, user.id);
  if (req.path.startsWith("/api/buyer/orders")) return orderRoutes(req, user.id);
  return favoriteRoutes(req, user.id);
}
