import type { DemoUser, ZekaiDb } from "./db";

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
  db: ZekaiDb;
}

/** One server-sent event of a stream and how long the "server" thinks before sending it. */
export interface SseStep {
  delay: number;
  data: unknown;
}

export type DemoResult = { status: number; body?: unknown; stream?: SseStep[] };

export const ok = (body: unknown): DemoResult => ({ status: 200, body });
export const noContent = (): DemoResult => ({ status: 204 });
export const stream = (steps: SseStep[]): DemoResult => ({ status: 200, stream: steps });

export function notFound(message = "Bulunamadı."): never {
  throw new HttpError(404, message);
}

export function badRequest(message: string): never {
  throw new HttpError(400, message);
}

/** The token is "demo.<userId>"; it is checked against the demo users like a JWT subject. */
export function currentUser(req: DemoRequest): DemoUser {
  const userId = req.token?.startsWith("demo.") ? req.token.slice(5) : null;
  const user = userId ? req.db.users.find((u) => u.id === userId) : undefined;
  if (!user) throw new HttpError(401, "Oturum süresi doldu. Lütfen tekrar giriş yapın.");
  return user;
}

export function body<T extends object>(req: DemoRequest): Partial<T> {
  return req.body && typeof req.body === "object" ? (req.body as Partial<T>) : {};
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function sseResponse(steps: SseStep[], signal?: AbortSignal | null): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const step of steps) {
        await wait(step.delay);
        if (signal?.aborted) {
          controller.error(new DOMException("Aborted", "AbortError"));
          return;
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(step.data)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(readable, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

export function toResponse(result: DemoResult, signal?: AbortSignal | null): Response {
  if (result.stream) return sseResponse(result.stream, signal);
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
  return wait(120 + Math.floor(Math.random() * 180));
}

export function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function daysAgo(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}
