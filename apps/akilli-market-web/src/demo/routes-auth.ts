import { commit, daysAgo, newId, type DemoUser } from "./db";
import { body, conflict, currentUser, HttpError, noContent, ok, type DemoRequest, type DemoResult } from "./http";

/** Passwords documented in the README for the seeded accounts, same as the real seeder. */
const SEED_PASSWORDS: Record<DemoUser["role"], string> = { Buyer: "Buyer123!", Seller: "Seller123!" };

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${salt}$${hex}`;
}

async function passwordMatches(user: DemoUser, password: string): Promise<boolean> {
  if (!user.passwordHash) return password === SEED_PASSWORDS[user.role];
  const [salt] = user.passwordHash.split("$");
  return (await hashPassword(password, salt)) === user.passwordHash;
}

function session(user: DemoUser) {
  return {
    token: `demo.${user.id}`,
    refreshToken: `demo-refresh.${user.id}`,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  };
}

async function login(req: DemoRequest): Promise<DemoResult> {
  const { email = "", password = "" } = body<{ email: string; password: string }>(req);
  const user = req.db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !(await passwordMatches(user, password))) throw new HttpError(401, "E-posta veya şifre hatalı.");
  return ok(session(user));
}

async function register(req: DemoRequest): Promise<DemoResult> {
  const { email = "", password = "", fullName = "", role = "buyer" } =
    body<{ email: string; password: string; fullName: string; role: string }>(req);
  const normalized = email.trim().toLowerCase();
  if (req.db.users.some((u) => u.email.toLowerCase() === normalized)) conflict("Bu e-posta zaten kayıtlı.");
  const user: DemoUser = {
    id: newId(), email: normalized, fullName: fullName.trim(),
    role: role.toLowerCase() === "seller" ? "Seller" : "Buyer",
    passwordHash: await hashPassword(password, newId().slice(0, 8)), createdAt: daysAgo(0),
  };
  req.db.users.push(user);
  if (user.role === "Seller") {
    req.db.sellers.push({
      id: newId(), userId: user.id, storeName: `${user.fullName} Mağazası`, ownerName: user.fullName,
      trustScore: 50, storeRating: 0, totalReviewCount: 0, fastShipping: false, returnDays: 14,
      apiKey: `am_live_${newId().replace(/-/g, "")}`,
    });
  }
  commit(req.db);
  return ok(session(user));
}

function refresh(req: DemoRequest): DemoResult {
  const { refreshToken = "" } = body<{ refreshToken: string }>(req);
  const userId = refreshToken.startsWith("demo-refresh.") ? refreshToken.slice(13) : "";
  const user = req.db.users.find((u) => u.id === userId);
  if (!user) throw new HttpError(401, "Geçersiz veya süresi dolmuş refresh token.");
  return ok(session(user));
}

export async function authRoutes(req: DemoRequest): Promise<DemoResult | null> {
  if (req.method === "POST" && req.path === "/api/auth/login") return login(req);
  if (req.method === "POST" && req.path === "/api/auth/register") return register(req);
  if (req.method === "POST" && req.path === "/api/auth/refresh") return refresh(req);
  if (req.method === "POST" && req.path === "/api/auth/logout") return noContent();
  if (req.method === "GET" && req.path === "/api/auth/me") {
    const user = currentUser(req);
    return ok({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
  }
  return null;
}
