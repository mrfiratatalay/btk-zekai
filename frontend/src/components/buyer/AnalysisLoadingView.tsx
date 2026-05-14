"use client";

import Image from "next/image";
import {
  Background, BaseEdge, EdgeLabelRenderer, Handle, MarkerType,
  Position, ReactFlow, type Edge, type EdgeProps, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CheckCircle2, Circle, FileCheck2, FileSearch,
  Gauge, GitBranch, ImageIcon, Loader2, MessageSquareText,
  PackageSearch, ReceiptText, RefreshCw, ScanLine,
  ShieldCheck, UserRoundSearch,
} from "lucide-react";
import { useMemo } from "react";
import type { AgentStep } from "@/types/analysis";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAnalysisProgress } from "@/components/buyer/useAnalysisProgress";

/* ── Stages (user-facing) ────────────────────────────────────────────────── */
const stages = [
  { from:0, to:1, label:"İhtiyaç analiz ediliyor",             done:"İhtiyaç analiz edildi",            icon:UserRoundSearch },
  { from:1, to:6, label:"Ürün ve güven sinyalleri toplanıyor", done:"Ürün ve güven sinyalleri toplandı", icon:FileSearch },
  { from:6, to:9, label:"Karar raporu doğrulanıyor",           done:"Karar raporu doğrulandı",           icon:FileCheck2 },
] as const;

const FEED = [
  { at:1, text:"Yorum forensiği tamamlandı" },
  { at:3, text:"Görsel tutarlılık kontrol edildi" },
  { at:4, text:"Satıcı güven sinyalleri değerlendirildi" },
  { at:5, text:"Fiyat ve pazar analizi yapıldı" },
  { at:7, text:"Risk skorları hesaplandı" },
  { at:8, text:"Kanıtsız iddialar rapordan elendi" },
];

/* ── React Flow setup ────────────────────────────────────────────────────── */
const ICON: Record<string, React.FC<{ className?: string }>> = {
  need: UserRoundSearch, product: PackageSearch, review: MessageSquareText,
  visual: ImageIcon, price: Gauge, return: RefreshCw,
  synthesis: GitBranch, verification: ShieldCheck, report: ReceiptText,
};

// 2-row layout — max width ~960px so nodes stay readable inside 92vw drawer
const POSITIONS: Record<string, { x: number; y: number }> = {
  "need-agent":         { x: 0,   y: 160 },
  "product-agent":      { x: 260, y: 20  },
  "review-agent":       { x: 260, y: 300 },
  "visual-agent":       { x: 520, y: 20  },
  "price-agent":        { x: 520, y: 300 },
  "return-agent":       { x: 780, y: 20  },
  "synthesis-agent":    { x: 780, y: 300 },
  "verification-agent": { x: 1040,y: 160 },
  "report-agent":       { x: 1300,y: 160 },
};

const EDGE_PAIRS = [
  ["need-agent","product-agent"], ["need-agent","review-agent"],
  ["product-agent","visual-agent"], ["review-agent","price-agent"],
  ["visual-agent","return-agent"], ["price-agent","synthesis-agent"],
  ["return-agent","verification-agent"], ["synthesis-agent","verification-agent"],
  ["verification-agent","report-agent"],
];

type AgentState = "pending" | "active" | "completed";
type AgentND = AgentStep & { state: AgentState };

/* ── Agent Node ─────────────────────────────────────────────────────────── */
function AgentNode({ data }: NodeProps<Node<AgentND>>) {
  const Icon = ICON[data.type] ?? PackageSearch;
  return (
    <div className={cn(
      "w-56 rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300",
      data.state === "completed" && "border-emerald-200 bg-emerald-50 shadow-emerald-100",
      data.state === "active"    && "border-violet-300 bg-violet-50 shadow-lg shadow-violet-100",
      data.state === "pending"   && "border-slate-100 opacity-50",
    )}>
      <Handle type="target" position={Position.Left} className="!border-0 !bg-slate-200" />
      <div className="flex items-start gap-3">
        <span className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
          data.state === "completed" && "bg-emerald-500 text-white",
          data.state === "active"    && "bg-violet-600 text-white",
          data.state === "pending"   && "bg-slate-100 text-slate-400",
        )}>
          {data.state === "completed" ? <CheckCircle2 className="size-5" />
           : data.state === "active"  ? <Loader2 className="size-5 animate-spin" />
           : <Icon className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-4 text-slate-800">{data.label}</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400 line-clamp-3">
            {data.state === "completed" ? data.summary : data.description}
          </p>
        </div>
      </div>
      {/* Status row */}
      <div className={cn(
        "mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
        data.state === "completed" && "bg-emerald-100 text-emerald-700",
        data.state === "active"    && "bg-violet-100 text-violet-700",
        data.state === "pending"   && "bg-slate-50 text-slate-400",
      )}>
        {data.state === "completed" ? <CheckCircle2 className="size-3" />
         : data.state === "active"  ? <Loader2 className="size-3 animate-spin" />
         : <Circle className="size-3" />}
        {data.state === "completed" ? "Tamamlandı"
         : data.state === "active"  ? "Çalışıyor..."
         : "Sırada"}
      </div>
      <Handle type="source" position={Position.Right} className="!border-0 !bg-slate-200" />
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
  agentSteps, userNeedText, product, analysisId, onComplete, completedOverride, disableTimer,
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
    <div className="flex min-h-screen flex-col bg-white">

      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        {product && (
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-slate-100">
            <Image src={product.image} alt={product.title} fill sizes="36px" className="object-contain p-1" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{product?.title ?? analysisId}</p>
          <p className="text-xs text-slate-400">{product?.sellerName}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-violet-600">
          <span className="size-1.5 animate-pulse rounded-full bg-violet-500" />
          Analiz ediliyor
        </span>
      </div>

      {/* Centered content */}
      <div className="mx-auto w-full max-w-md flex-1 space-y-10 px-6 py-10">

        <p className="text-base italic leading-7 text-slate-500">&quot;{userNeedText}&quot;</p>

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
                  done   && "bg-emerald-100 text-emerald-600",
                  active && "bg-violet-100 text-violet-600",
                  !done && !active && "bg-slate-100 text-slate-300",
                )}>
                  {done   ? <CheckCircle2 className="size-3.5" />
                  : active ? <Loader2 className="size-3.5 animate-spin" />
                  : <Icon className="size-3.5" />}
                </span>
                <span className={cn(
                  "text-sm transition-colors",
                  done   && "text-emerald-700",
                  active && "font-medium text-slate-900",
                  !done && !active && "text-slate-300",
                )}>
                  {done ? stage.done : stage.label}
                </span>
              </div>
            );
          })}
          <div className="h-0.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Live feed */}
        <div className="space-y-3">
          {FEED.map(item => {
            const revealed = completed >= item.at;
            return (
              <div key={item.text} className={cn(
                "flex items-center gap-2.5 text-sm transition-opacity duration-500",
                revealed ? "opacity-100" : "opacity-20",
              )}>
                {revealed
                  ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  : <Circle className="size-4 shrink-0 text-slate-300" />}
                <span className={revealed ? "text-slate-700" : "text-slate-400"}>{item.text}</span>
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
              className="gap-2 rounded-lg border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-700"
            >
              <ScanLine className="size-4" />
              Teknik agent akışını izle
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            showCloseButton
            style={{ width: "72vw", maxWidth: "none" }}
            className="flex flex-col gap-0 p-0"
          >
            <SheetHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
              <SheetTitle className="text-sm font-semibold text-slate-900">
                Agent Trace — Canlı
              </SheetTitle>
              <p className="text-xs text-slate-400">
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
                <Background color="#F1F5F9" gap={24} size={1} />
              </ReactFlow>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}
