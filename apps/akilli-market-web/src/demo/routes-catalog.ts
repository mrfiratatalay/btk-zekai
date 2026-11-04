import { CATALOG } from "./catalog";
import { commit, daysAgo, nextSeq } from "./db";
import {
  findProduct, findPublicProduct, isPublicBundleVisible, toDetailDto, toListDto, toPublicBundleDto, toReviewDto,
} from "./domain";
import { badRequest, body, conflict, created, currentUser, notFound, ok, type DemoRequest, type DemoResult } from "./http";

const PRODUCT_PATH = /^\/api\/products\/([^/]+)(?:\/(reviews|price-history|bundles|faqs))?$/;

function listProducts(req: DemoRequest): DemoResult {
  const category = req.query.get("category");
  const search = req.query.get("search")?.toLocaleLowerCase("tr-TR");
  const slugOf = (id: number) => CATALOG.categories.find((c) => c.id === id)?.slug;
  return ok(req.db.products
    .filter((p) => p.published)
    .filter((p) => !category || slugOf(p.categoryId) === category)
    .filter((p) => !search || p.title.toLocaleLowerCase("tr-TR").includes(search))
    .map((p) => toListDto(req.db, p)));
}

function createReview(req: DemoRequest, productId: string): DemoResult {
  const user = currentUser(req, "Buyer");
  findProduct(req.db, productId);
  const ownsProduct = req.db.sellers.some((s) => s.userId === user.id && req.db.products.some((p) => p.id === productId && p.sellerId === s.id));
  if (ownsProduct) conflict("Kendi ürününüze yorum yapamazsınız.");
  if (req.db.reviews.some((r) => r.productId === productId && r.userId === user.id)) conflict("Bu ürün için zaten bir yorum yaptınız.");
  const input = body<{ rating: number; title: string; text: string; tags: string[] }>(req);
  const verifiedPurchase = req.db.orders.some((o) => o.buyerId === user.id && o.items.some((i) => i.productId === productId));
  const review = {
    id: nextSeq(req.db), productId, userId: user.id, authorName: user.fullName,
    rating: Math.min(5, Math.max(1, Math.round(Number(input.rating) || 1))),
    title: (input.title ?? "").trim(), text: (input.text ?? "").trim(), verifiedPurchase,
    date: daysAgo(0, new Date().getHours()), helpfulCount: 0, tags: Array.isArray(input.tags) ? input.tags : [],
  };
  req.db.reviews.push(review);
  commit(req.db);
  return created(toReviewDto(req.db, review.id));
}

/** Same five points as the seeder: the price drifts toward today, the market median stays at 95%. */
function priceHistory(price: number) {
  return ["G-30", "G-20", "G-10", "G-5", "Bugün"].map((day, i) => ({
    day, price: Math.round(price * (0.9 + i * 0.025) * 100) / 100, marketMedian: Math.round(price * 0.95 * 100) / 100,
  }));
}

function productRoutes(req: DemoRequest, id: string, section: string | undefined): DemoResult | null {
  if (!section && req.method === "GET") return ok(toDetailDto(req.db, findPublicProduct(req.db, id)));
  if (section === "reviews" && req.method === "GET") {
    return ok(req.db.reviews
      .filter((r) => r.productId === id)
      .sort((a, b) => b.helpfulCount - a.helpfulCount)
      .map((r) => toReviewDto(req.db, r.id)));
  }
  if (section === "reviews" && req.method === "POST") return createReview(req, id);
  if (section === "price-history" && req.method === "GET") {
    const product = req.db.products.find((p) => p.id === id);
    return ok(product ? priceHistory(product.price) : []);
  }
  if (section === "bundles" && req.method === "GET") {
    return ok(req.db.bundles
      .filter((b) => b.primaryProductId === id && isPublicBundleVisible(req.db, b))
      .sort((a, b) => b.score - a.score)
      .map((b) => toPublicBundleDto(req.db, b)));
  }
  if (section === "faqs" && req.method === "GET") {
    return ok(req.db.faqs
      .filter((f) => f.productId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
      .map(({ productId: _productId, ...faq }) => faq));
  }
  return null;
}

export function catalogRoutes(req: DemoRequest): DemoResult | null {
  if (req.method === "GET" && req.path === "/api/categories") return ok(CATALOG.categories);
  if (req.method === "GET" && req.path === "/api/products") return listProducts(req);
  if (req.method === "GET" && req.path === "/api/products/from-url") {
    const url = req.query.get("url") ?? "";
    if (!url.trim()) badRequest("url parametresi zorunludur.");
    const match = url.match(/\/(?:product|urun|products)\/([^/?#]+)/i);
    if (!match) notFound("Ürün bulunamadı.");
    return ok(toDetailDto(req.db, findPublicProduct(req.db, decodeURIComponent(match[1]))));
  }
  const match = req.path.match(PRODUCT_PATH);
  return match ? productRoutes(req, decodeURIComponent(match[1]), match[2]) : null;
}
