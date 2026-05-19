"use client";

import Image from "next/image";
import {
  Background, BaseEdge, EdgeLabelRenderer, Handle, MarkerType,
  Position, ReactFlow, type Edge, type EdgeProps, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CheckCircle2, Circle, FileCheck2, FileSearch,
  Gauge, GitBranch, Loader2, MessageSquareText,
  PackageSearch, ScanLine, ShieldCheck, UserRoundSearch,
} from "lucide-react";
import { useMemo } from "react";
import type { AgentStep } from "@/types/analysis";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAnalysisProgress } from "@/components/platform/useAnalysisProgress";

/* ── Stages (user-facing) — 6 adım: 0-1 / 1-4 / 4-6 ─────────────────────── */
const stages = [
  { from:0, to:1, label:"Ürün ve ihtiyaç değerlendiriliyor", done:"Ürün ve ihtiyaç değerlendirildi", icon:UserRoundSearch },
  { from:1, to:2, label:"Gerekirse piyasa kontrolü yapılıyor", done:"Piyasa kontrolü tamamlandı", icon:FileSearch },
  { from:2, to:3, label:"Karar raporu hazırlanıyor", done:"Karar raporu hazırlandı", icon:FileCheck2 },
] as const;

// FEED: `at` değerleri 0-6 aralığında, gerçek ajan tamamlama sırasına göre
const FEED = [
  { at:1, text:"Ürün, ihtiyaç ve yorum sinyalleri birlikte değerlendirildi" },
  { at:2, text:"Piyasa kontrolü gerekiyorsa tamamlandı" },
  { at:3, text:"Final karar raporu hazırlandı" },
];

/* ── React Flow setup — 6 gerçek ajan ──────────────────────────────────── */
const ICON: Record<string, React.FC<{ className?: string }>> = {
  need:         UserRoundSearch,
  price:        Gauge,
  review:       MessageSquareText,
  alternatives: ScanLine,
  synthesis:    GitBranch,
  verification: ShieldCheck,
};

// Pipeline: need → (price | review | alternatives) → synthesis → verification
const POSITIONS: Record<string, { x: number; y: number }> = {
  "advisor-agent": { x: 0,   y: 180 },
  "market-agent":  { x: 300, y: 180 },
  "decision-agent": { x: 600, y: 180 },
};

const EDGE_PAIRS = [
  ["advisor-agent", "market-agent"],
  ["market-agent", "decision-agent"],
];

type AgentState = "pending" | "active" | "completed";
type AgentND = AgentStep & { state: AgentState };

/* ── Agent Node ─────────────────────────────────────────────────────────── */
function AgentNode({ data }: NodeProps<Node<AgentND>>) {
  const Icon = ICON[data.type] ?? PackageSearch;
  return (
    <div className={cn(
      "w-56 rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 dark:bg-card",
      data.state === "completed" && "border-emerald-200 bg-emerald-50 shadow-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:shadow-none",
      data.state === "active"    && "border-violet-300 bg-violet-50 shadow-lg shadow-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:shadow-none",
      data.state === "pending"   && "border-slate-100 opacity-50 dark:border-white/10",
    )}>
      <Handle type="target" position={Position.Left} className="!border-0 !bg-slate-200 dark:!bg-white/20" />
      <div className="flex items-start gap-3">
        <span className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
          data.state === "completed" && "bg-emerald-500 text-white",
          data.state === "active"    && "bg-violet-600 text-white",
          data.state === "pending"   && "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500",
        )}>
          {data.state === "completed" ? <CheckCircle2 className="size-5" />
           : data.state === "active"  ? <Loader2 className="size-5 animate-spin" />
           : <Icon className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-4 text-slate-800 dark:text-slate-100">{data.label}</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400 line-clamp-3">
            {data.state === "completed" ? data.summary : data.description}
          </p>
        </div>
      </div>
      {/* Status row */}
      <div className={cn(
        "mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
        data.state === "completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        data.state === "active"    && "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
        data.state === "pending"   && "bg-slate-50 text-slate-400 dark:bg-white/5 dark:text-slate-500",
      )}>
        {data.state === "completed" ? <CheckCircle2 className="size-3" />
         : data.state === "active"  ? <Loader2 className="size-3 animate-spin" />
         : <Circle className="size-3" />}
        {data.state === "completed" ? "Tamamlandı"
         : data.state === "active"  ? "Çalışıyor..."
         : "Sırada"}
      </div>
      <Handle type="source" position={Position.Right} className="!border-0 !bg-slate-200 dark:!bg-white/20" />
    </div>
  );
}

/* ── Edge ────────────────────────────────────────────────────────────────── */
function AgentEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, data }: EdgeProps) {
  const path = `M ${sourceX},${sourceY} C ${sourceX+80},${sourceY} ${targetX-80},${targetY} ${targetX},${targetY}`;
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{
        stroke: data?.active ? "#7C3AED" : "#E2E8F0",
        strokeWidth: data?.active ? 2.5 : 1.5,
        transition: "stroke 0.4s, stroke-width 0.4s",
      }} />
      {data?.active && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute flex size-5 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white shadow"
            style={{ transform: `translate(-50%,-50%) translate(${(sourceX+targetX)/2}px,${(sourceY+targetY)/2}px)` }}
          >
            →
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const NODE_TYPES = { agent: AgentNode };
const EDGE_TYPES = { agent: AgentEdge };

/* ─────────────────────────────────────────────────────────────────────────── */

export function AnalysisLoadingView({
  agentSteps, userNeedText, product, liveFindings, analysisId, onComplete, completedOverride, disableTimer,
}: {
  agentSteps: AgentStep[];
  userNeedText: string;
  liveFindings?: string[];
  product?: Product;
  analysisId: string;
  onComplete: () => void;
  completedOverride?: number;
  disableTimer?: boolean;
}) {
  const { completed, progress } = useAnalysisProgress(agentSteps, onComplete, {
    completedOverride,
    disableTimer,
  });

  /* nodes & edges — reactive to `completed` */
  const nodes = useMemo<Node<AgentND>[]>(() =>
    agentSteps.map((step, i) => ({
      id: step.id,
      type: "agent",
      position: POSITIONS[step.id] ?? { x: i * 280, y: 180 },
      data: {
        ...step,
        state: i < completed ? "completed" : i === completed ? "active" : "pending",
      },
    })), [agentSteps, completed]);

  const edges = useMemo<Edge[]>(() =>
    EDGE_PAIRS.map(([src, tgt]) => {
      const si = agentSteps.findIndex(s => s.id === src);
      return {
        id: `${src}→${tgt}`, source: src, target: tgt, type: "agent",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#7C3AED", width: 16, height: 16 },
        data: { active: si > -1 && si < completed },
      };
    }), [agentSteps, completed]);

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        {product && (
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={product.image} alt={product.title} fill sizes="36px" className="object-contain p-1" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{product?.title ?? analysisId}</p>
          <p className="text-xs text-muted-foreground">{product?.sellerName}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#5a8a00] dark:text-[#adff41]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#adff41]" />
          Analiz ediliyor
        </span>
      </div>

      {/* Centered content */}
      <div className="mx-auto w-full max-w-md flex-1 space-y-10 px-6 py-10">

        <p className="text-base italic leading-7 text-muted-foreground">&quot;{userNeedText}&quot;</p>

        {/* 3-step progress */}
        <div className="space-y-5">
          {stages.map(stage => {
            const done   = completed >= stage.to;
            const active = !done && completed >= stage.from;
            const Icon   = stage.icon;
            return (
              <div key={stage.done} className="flex items-center gap-3">
                <span className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                  done   && "bg-[#adff41]/20 text-[#5a8a00] dark:text-[#adff41]",
                  active && "bg-purple-500/20 text-purple-400",
                  !done && !active && "bg-muted text-muted-foreground/50",
                )}>
                  {done   ? <CheckCircle2 className="size-3.5" />
                  : active ? <Loader2 className="size-3.5 animate-spin" />
                  : <Icon className="size-3.5" />}
                </span>
                <span className={cn(
                  "text-sm transition-colors",
                  done   && "text-[#5a8a00] dark:text-[#adff41]",
                  active && "font-medium text-foreground",
                  !done && !active && "text-muted-foreground/50",
                )}>
                  {done ? stage.done : stage.label}
                </span>
              </div>
            );
          })}
          <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#ADFF41] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Live feed */}
        <div className="space-y-3">
          {(liveFindings && liveFindings.length > 0 ? liveFindings.map((text, i) => ({ at: i, text })) : FEED).map((item, _i) => {
            const revealed = liveFindings && liveFindings.length > 0
              ? true
              : completed >= item.at;
            return (
              <div key={item.text} className={cn(
                "flex items-center gap-2.5 text-sm transition-opacity duration-500",
                revealed ? "opacity-100" : "opacity-20",
              )}>
                {revealed
                  ? <CheckCircle2 className="size-4 shrink-0 text-[#5a8a00] dark:text-[#adff41]" />
                  : <Circle className="size-4 shrink-0 text-muted-foreground/50" />}
                <span className={revealed ? "text-foreground/70" : "text-muted-foreground/50"}>{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* Agent trace — side drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg border-border bg-muted text-muted-foreground hover:border-border hover:text-foreground"
            >
              <ScanLine className="size-4" />
              Agent akışını izle
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            showCloseButton
            style={{ width: "72vw", maxWidth: "none" }}
            className="flex flex-col gap-0 p-0 bg-background border-border"
          >
            <SheetHeader className="shrink-0 border-b border-border px-6 py-4">
              <SheetTitle className="text-sm font-semibold text-foreground">
                Agent Trace
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Ajanlar sırayla aktive olur. Kanıt üretince yeşile döner. Kaydırabilir, yakınlaştırabilirsin.
              </p>
            </SheetHeader>

            {/* Full-height React Flow */}
            <div className="min-h-0 flex-1">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                fitView
                fitViewOptions={{ padding: 0.12, maxZoom: 0.95 }}
                minZoom={0.4}
                maxZoom={2}
                nodesDraggable={false}
                nodesConnectable={false}
                panOnDrag
                panOnScroll
                zoomOnScroll
                zoomOnPinch
                zoomOnDoubleClick={false}
                preventScrolling={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#1a1a2e" gap={24} size={1} />
              </ReactFlow>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}
