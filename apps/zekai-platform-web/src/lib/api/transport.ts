/**
 * Every request to zekai-api and commerce-api goes through this function.
 *
 * Builds with NEXT_PUBLIC_DATA_MODE=api (Docker, local full stack) use the real network.
 * Every other build, such as the Vercel demo, answers in the browser with the demo
 * handler, which keeps the same request and response contract. Because the condition is
 * a build-time constant, API builds never bundle the demo code.
 */
export const isDemoMode = process.env.NEXT_PUBLIC_DATA_MODE !== "api";

export async function transport(input: string, init?: RequestInit): Promise<Response> {
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "api") {
    const { demoFetch } = await import("@/demo/handler");
    return demoFetch(input, init);
  }
  return fetch(input, init);
}
