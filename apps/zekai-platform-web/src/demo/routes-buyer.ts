import { commit } from "./db";
import { body, currentUser, daysAgo, newId, noContent, notFound, ok, type DemoRequest, type DemoResult } from "./http";

/** Saved analyses, decision rooms (projects), kombins and the buyer profile, as in BuyerService. */
type Row = Record<string, unknown>;

function strip(row: Row) {
  const { userId: _userId, ...dto } = row;
  return dto;
}

function analysisRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const db = req.db;
  const mine = () => db.analyses.filter((a) => a.userId === userId);
  if (req.path === "/api/buyer/analyses" && req.method === "GET") {
    return ok(mine().sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt))).map(strip));
  }
  if (req.path === "/api/buyer/analyses" && req.method === "POST") {
    const input = body<Row>(req);
    let row = mine().find((a) => a.externalId === input.externalId);
    if (!row) {
      row = { id: newId(), userId, status: "thinking", userNote: null, savedAt: new Date().toISOString() };
      db.analyses.push(row);
    }
    Object.assign(row, {
      externalId: input.externalId, productId: input.productId, productTitle: input.productTitle, productImage: input.productImage,
      productPrice: input.productPrice, sellerName: input.sellerName, userNeedText: input.userNeedText,
      overallRiskPercent: Math.round(Number(input.overallRiskPercent) || 0), recommendationLevel: input.recommendationLevel, scoresJson: input.scoresJson,
    });
    commit(db);
    return ok(strip(row));
  }
  const match = req.path.match(/^\/api\/buyer\/analyses\/([^/]+)$/);
  if (!match) return null;
  const row = mine().find((a) => a.id === match[1]) ?? notFound("Analiz bulunamadı.");
  if (req.method === "DELETE") {
    db.analyses = db.analyses.filter((a) => a !== row);
    for (const project of db.projects) project.analysisIds = project.analysisIds.filter((id) => id !== row.externalId);
    commit(db);
    return noContent();
  }
  if (req.method !== "PUT") return null;
  const { status, userNote } = body<{ status: string; userNote: string }>(req);
  if (status !== undefined) row.status = status;
  if (userNote !== undefined) row.userNote = userNote;
  commit(db);
  return ok(strip(row));
}

function projectRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const db = req.db;
  const mine = () => db.projects.filter((p) => p.userId === userId);
  if (req.path === "/api/buyer/projects" && req.method === "GET") return ok(mine().map(strip));
  if (req.path === "/api/buyer/projects" && req.method === "POST") {
    const input = body<{ externalId: string; title: string; goal: string; budget: number; savedAnalysisIds: string[] }>(req);
    const project = {
      id: newId(), userId, externalId: input.externalId || `project-${Date.now()}-${newId().slice(0, 4)}`, title: input.title ?? "",
      goal: input.goal ?? null, budget: input.budget ?? null, createdAt: new Date().toISOString(), analysisIds: input.savedAnalysisIds ?? [],
    };
    db.projects.push(project);
    commit(db);
    return ok(strip(project));
  }
  const match = req.path.match(/^\/api\/buyer\/projects\/([^/]+)(?:\/analyses\/([^/]+))?$/);
  if (!match) return null;
  const project = mine().find((p) => p.externalId === decodeURIComponent(match[1])) ?? notFound("Proje bulunamadı.");
  if (match[2]) {
    const analysisId = decodeURIComponent(match[2]);
    if (req.method === "POST") {
      if (!db.analyses.some((a) => a.userId === userId && a.externalId === analysisId)) notFound("Analiz bulunamadı.");
      if (!project.analysisIds.includes(analysisId)) project.analysisIds.push(analysisId);
    } else if (req.method === "DELETE") {
      project.analysisIds = project.analysisIds.filter((id) => id !== analysisId);
    } else return null;
    commit(db);
    return ok(strip(project));
  }
  if (req.method === "DELETE") {
    db.projects = db.projects.filter((p) => p !== project);
    commit(db);
    return noContent();
  }
  if (req.method !== "PUT") return null;
  const input = body<{ title: string; goal: string; budget: number }>(req);
  if (input.title !== undefined) project.title = input.title;
  if (input.goal !== undefined) project.goal = input.goal;
  if (input.budget !== undefined) project.budget = input.budget;
  commit(db);
  return ok(strip(project));
}

function kombinRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const db = req.db;
  if (req.path === "/api/buyer/kombins" && req.method === "GET") {
    return ok(db.kombins.filter((k) => k.userId === userId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).map(strip));
  }
  if (req.path === "/api/buyer/kombins" && req.method === "POST") {
    const input = body<Row>(req);
    const externalId = String(input.externalId || `kombin-${Date.now()}`);
    db.kombins = db.kombins.filter((k) => !(k.userId === userId && k.externalId === externalId));
    const row = {
      id: newId(), userId, externalId, title: input.title ?? "", goalText: input.goalText ?? "", budget: input.budget ?? null,
      productsJson: input.productsJson ?? "[]", resultJson: input.resultJson ?? "{}", createdAt: daysAgo(0, new Date().getHours()),
    };
    db.kombins.push(row);
    commit(db);
    return ok(strip(row));
  }
  const match = req.path.match(/^\/api\/buyer\/kombins\/([^/]+)$/);
  if (!match || req.method !== "DELETE") return null;
  const id = decodeURIComponent(match[1]);
  db.kombins = db.kombins.filter((k) => !(k.userId === userId && (k.externalId === id || k.id === id)));
  commit(db);
  return noContent();
}

export function buyerRoutes(req: DemoRequest): DemoResult | null {
  if (!req.path.startsWith("/api/buyer/")) return null;
  const user = currentUser(req);
  if (req.path === "/api/buyer/profile") {
    if (req.method === "PUT") {
      const input = body<{ profileName: string; onboarded: boolean }>(req);
      if (input.profileName !== undefined) user.profileName = input.profileName;
      if (input.onboarded !== undefined) user.onboarded = input.onboarded;
      commit(req.db);
    }
    return ok({ profileName: user.profileName, onboarded: user.onboarded });
  }
  return analysisRoutes(req, user.id) ?? projectRoutes(req, user.id) ?? kombinRoutes(req, user.id);
}
