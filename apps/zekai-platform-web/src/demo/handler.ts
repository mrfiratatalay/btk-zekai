import { commerceRoutes } from "./commerce";
import { getDb } from "./db";
import { HttpError, networkDelay, parseBody, readBearer, toResponse, type DemoRequest, type DemoResult } from "./http";
import { authRoutes } from "./routes-auth";
import { buyerRoutes } from "./routes-buyer";
import { buyerAiRoutes } from "./routes-buyer-ai";
import { sellerRoutes } from "./routes-seller";
import { sellerAiRoutes } from "./routes-seller-ai";

/**
 * Browser-side stand-in for zekai-api (and the commerce-api calls the screens make). It
 * takes the same URL and RequestInit as fetch and returns a real Response; streaming
 * endpoints answer with a text/event-stream body, so the SSE readers run unchanged.
 */
export async function demoFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(input, "https://demo.zekai.local");
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
      (await authRoutes(req)) ?? commerceRoutes(req) ?? buyerAiRoutes(req) ?? buyerRoutes(req)
      ?? (await sellerAiRoutes(req)) ?? sellerRoutes(req);
    if (result) return toResponse(result, init.signal);
    return toResponse({ status: 404, body: { message: "Bu işlem demo modunda bulunmuyor." } });
  } catch (error) {
    if (error instanceof HttpError) return toResponse({ status: error.status, body: { message: error.message } });
    return toResponse({ status: 500, body: { message: "Demo isteği işlenemedi." } });
  }
}
