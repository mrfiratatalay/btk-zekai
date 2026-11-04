import type { DemoDb, DemoUser } from "./db";

/** A demo route throws this to answer with the same status and `{ message }` body as the API. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface DemoRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
  token: string | null;
  db: DemoDb;
}

export type DemoResult = { status: number; body?: unknown };

export const ok = (body: unknown): DemoResult => ({ status: 200, body });
export const created = (body: unknown): DemoResult => ({ status: 201, body });
export const noContent = (): DemoResult => ({ status: 204 });

export function notFound(message = "Bulunamadı."): never {
  throw new HttpError(404, message);
}

export function badRequest(message: string): never {
  throw new HttpError(400, message);
}

export function conflict(message: string): never {
  throw new HttpError(409, message);
}

/** The token is "demo.<userId>"; it is checked against the demo users like a JWT subject. */
export function currentUser(req: DemoRequest, role?: DemoUser["role"]): DemoUser {
  const userId = req.token?.startsWith("demo.") ? req.token.slice(5) : null;
  const user = userId ? req.db.users.find((u) => u.id === userId) : undefined;
  if (!user) throw new HttpError(401, "Oturum süresi doldu. Lütfen tekrar giriş yapın.");
  if (role && user.role !== role) throw new HttpError(403, "Bu işlem için yetkiniz yok.");
  return user;
}

export function body<T extends object>(req: DemoRequest): Partial<T> {
  return req.body && typeof req.body === "object" ? (req.body as Partial<T>) : {};
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toResponse(result: DemoResult): Response {
  if (result.status === 204 || result.body === undefined) return new Response(null, { status: result.status });
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}

export function readBearer(headers: HeadersInit | undefined): string | null {
  const value = new Headers(headers).get("Authorization");
  return value?.startsWith("Bearer ") ? value.slice(7).trim() : null;
}

export function parseBody(raw: BodyInit | null | undefined): unknown {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Short random latency so loading states in the screens are visible, as with a real API. */
export function networkDelay(): Promise<void> {
  const ms = 120 + Math.floor(Math.random() * 180);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
