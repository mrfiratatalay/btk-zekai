import { categoryById, CATALOG } from "./catalog";
import { commit, newId, type DemoDb, type DemoProduct, type DemoSeller } from "./db";
import { primaryImage, slugify, toDetailDto } from "./domain";
import { badRequest, body, created, currentUser, noContent, notFound, ok, type DemoRequest, type DemoResult } from "./http";
import { toStoredImage } from "./image";

function sellerOf(req: DemoRequest): DemoSeller {
  const user = currentUser(req, "Seller");
  return req.db.sellers.find((s) => s.userId === user.id) ?? notFound("Satıcı bulunamadı.");
}

function ownedProduct(db: DemoDb, seller: DemoSeller, productId: string): DemoProduct {
  const product = db.products.find((p) => p.id === productId && p.sellerId === seller.id);
  return product ?? notFound("Ürün bulunamadı.");
}

function toSellerProductDto(p: DemoProduct) {
  return {
    id: p.id, title: p.title, primaryImage: primaryImage(p), category: categoryById(p.categoryId).name,
    price: p.price, stock: p.stock, isPublished: p.published, updatedAt: p.updatedAt,
  };
}

type ProductInput = Partial<{
  title: string; brand: string; categoryId: number; price: number; originalPrice: number | null; clearOriginalPrice: boolean;
  shortDescription: string; description: string; cargoText: string; stock: number; primaryImageUrl: string;
  features: Record<string, string>;
}>;

function createProduct(req: DemoRequest, seller: DemoSeller): DemoResult {
  const input = body<ProductInput>(req) as ProductInput;
  if (!CATALOG.categories.some((c) => c.id === input.categoryId)) notFound("Kategori bulunamadı.");
  let id = slugify(input.title ?? "");
  if (!id || req.db.products.some((p) => p.id === id)) id = `${id || "urun"}-${newId().replace(/-/g, "").slice(0, 6)}`;
  const product: DemoProduct = {
    id, title: input.title ?? "", brand: input.brand ?? "", sellerName: seller.storeName, categoryId: input.categoryId!,
    price: Number(input.price) || 0, originalPrice: input.originalPrice ?? null, stock: Number(input.stock) || 0,
    shortDescription: input.shortDescription ?? "", description: input.description ?? "", features: input.features ?? {},
    badges: [], cargoText: input.cargoText ?? "Ücretsiz Kargo", images: input.primaryImageUrl ? [input.primaryImageUrl] : [],
    sellerId: seller.id, published: true, updatedAt: new Date().toISOString(),
  };
  req.db.products.push(product);
  commit(req.db);
  return created(toSellerProductDto(product));
}

function updateProduct(req: DemoRequest, product: DemoProduct): DemoResult {
  const input = body<ProductInput>(req) as ProductInput;
  if (input.categoryId !== undefined && !CATALOG.categories.some((c) => c.id === input.categoryId)) notFound("Kategori bulunamadı.");
  const fields = ["title", "shortDescription", "description", "brand", "cargoText"] as const;
  for (const field of fields) if (typeof input[field] === "string") product[field] = input[field] as string;
  if (input.features) product.features = input.features;
  if (typeof input.price === "number") product.price = input.price;
  if (typeof input.stock === "number") product.stock = input.stock;
  if (input.clearOriginalPrice) product.originalPrice = null;
  else if (typeof input.originalPrice === "number") product.originalPrice = input.originalPrice;
  if (typeof input.categoryId === "number") product.categoryId = input.categoryId;
  if (input.primaryImageUrl?.trim()) product.images = [input.primaryImageUrl, ...product.images.slice(1)];
  product.updatedAt = new Date().toISOString();
  commit(req.db);
  return ok({ message: "Ürün güncellendi." });
}

/** Deleting a product archives its bundles instead of leaving them pointing at nothing. */
function deleteProduct(req: DemoRequest, seller: DemoSeller, product: DemoProduct): DemoResult {
  const db = req.db;
  db.products = db.products.filter((p) => p.id !== product.id);
  db.reviews = db.reviews.filter((r) => r.productId !== product.id);
  for (const bundle of db.bundles) {
    if (bundle.sellerId === seller.id && (bundle.primaryProductId === product.id || bundle.complementaryProductId === product.id)) {
      bundle.status = 2;
      bundle.updatedAt = new Date().toISOString();
    }
  }
  commit(db);
  return noContent();
}

async function productRoutes(req: DemoRequest, seller: DemoSeller): Promise<DemoResult | null> {
  const db = req.db;
  if (req.path === "/api/seller/products" && req.method === "GET") {
    return ok(db.products.filter((p) => p.sellerId === seller.id).map(toSellerProductDto));
  }
  if (req.path === "/api/seller/products" && req.method === "POST") return createProduct(req, seller);
  const match = req.path.match(/^\/api\/seller\/products\/([^/]+)(?:\/(publish|image))?$/);
  if (!match) return null;
  const product = ownedProduct(db, seller, decodeURIComponent(match[1]));
  if (!match[2] && req.method === "GET") return ok(toDetailDto(db, product));
  if (!match[2] && req.method === "PUT") return updateProduct(req, product);
  if (!match[2] && req.method === "DELETE") return deleteProduct(req, seller, product);
  if (match[2] === "publish" && req.method === "PUT") {
    product.published = Boolean(body<{ published: boolean }>(req).published);
    product.updatedAt = new Date().toISOString();
    commit(db);
    return ok({ message: product.published ? "Ürün yayınlandı." : "Ürün gizlendi." });
  }
  if (match[2] === "image" && req.method === "PUT") {
    const { imageBase64 = "", mimeType = "image/png" } = body<{ imageBase64: string; mimeType: string }>(req);
    if (!imageBase64) badRequest("Görsel verisi boş.");
    const imageUrl = await toStoredImage(imageBase64, mimeType);
    product.images = [imageUrl, ...product.images.slice(1)];
    product.updatedAt = new Date().toISOString();
    commit(db);
    return ok({ imageUrl, message: "Görsel güncellendi." });
  }
  return null;
}

export async function sellerRoutes(req: DemoRequest): Promise<DemoResult | null> {
  if (!req.path.startsWith("/api/seller/")) return null;
  const seller = sellerOf(req);
  if (req.path === "/api/seller/apikey" && req.method === "GET") return ok({ apiKey: seller.apiKey });
  if (req.path === "/api/seller/apikey/regenerate" && req.method === "POST") {
    seller.apiKey = `am_live_${newId().replace(/-/g, "")}`;
    commit(req.db);
    return ok({ apiKey: seller.apiKey });
  }
  if (req.path === "/api/seller/me" && req.method === "GET") {
    const { userId: _userId, apiKey: _apiKey, ...profile } = seller;
    return ok(profile);
  }
  return productRoutes(req, seller);
}
