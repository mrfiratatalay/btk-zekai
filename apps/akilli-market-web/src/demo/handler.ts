import { getDb } from "./db";
import { HttpError, networkDelay, parseBody, readBearer, toResponse, type DemoRequest, type DemoResult } from "./http";
import { authRoutes } from "./routes-auth";
import { buyerRoutes } from "./routes-buyer";
import { catalogRoutes } from "./routes-catalog";
import { sellerRoutes } from "./routes-seller";

/**
 * Browser-side stand-in for commerce-api. It takes the same URL and RequestInit as fetch
 * and returns a real Response, so the API client code (error handling, 401 refresh,
 * 204 handling) runs unchanged in both modes.
 */
export async function demoFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(input, "https://demo.akilli-market.local");
  const method = (init.method ?? "GET").toUpperCase();
  // Writes run on a copy: a failing request leaves nothing half-applied, like a transaction.
  const db = method === "GET" ? getDb() : structuredClone(getDb());
  const req: DemoRequest = {
    method, path: url.pathname.replace(/\/$/, ""), query: url.searchParams,
    body: parseBody(init.body), token: readBearer(init.headers), db,
  };
  await networkDelay();
  try {
    const result: DemoResult | null =
      (await authRoutes(req)) ?? catalogRoutes(req) ?? buyerRoutes(req) ?? (await sellerRoutes(req));
    if (result) return toResponse(result);
    return toResponse({ status: 404, body: { message: "Bu işlem demo modunda bulunmuyor." } });
  } catch (error) {
    if (error instanceof HttpError) return toResponse({ status: error.status, body: { message: error.message } });
    return toResponse({ status: 500, body: { message: "Demo isteği işlenemedi." } });
  }
}
