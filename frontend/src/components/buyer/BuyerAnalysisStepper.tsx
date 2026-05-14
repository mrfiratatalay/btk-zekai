"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  FileCheck2,
  FileSearch,
  Gauge,
  GitBranch,
  ImageIcon,
  Loader2,
  MessageSquareText,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";
import type { AgentStep } from "@/types/analysis";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const positions: Record<string, { x: number; y: number }> = {
  "need-agent": { x: 0, y: 120 },
  "product-agent": { x: 290, y: 20 },
  "review-agent": { x: 290, y: 220 },
  "visual-agent": { x: 580, y: 20 },
  "price-agent": { x: 580, y: 220 },
  "return-agent": { x: 870, y: 20 },
  "synthesis-agent": { x: 870, y: 220 },
  "verification-agent": { x: 1160, y: 120 },
  "report-agent": { x: 1450, y: 120 },
};

const edgePairs = [
  ["need-agent", "product-agent"],
  ["need-agent", "review-agent"],
  ["product-agent", "visual-agent"],
  ["review-agent", "price-agent"],
  ["visual-agent", "return-agent"],
  ["price-agent", "synthesis-agent"],
  ["return-agent", "verification-agent"],
  ["synthesis-agent", "verification-agent"],
  ["verification-agent", "report-agent"],
];

const stagePositions = [
  { x: 0, y: 80 },
  { x: 360, y: 80 },
  { x: 720, y: 80 },
];

const stageEdgePairs = [
  ["stage-0", "stage-1"],
  ["stage-1", "stage-2"],
];

const iconByType = {
  need: UserRoundSearch,
  product: PackageSearch,
  review: MessageSquareText,
  visual: ImageIcon,
  price: Gauge,
  return: RefreshCw,
  synthesis: GitBranch,
  verification: ShieldCheck,
  report: ReceiptText,
};

const decisionStages = [
  {
    title: "İhtiyacın anlaşılıyor",
    doneTitle: "İhtiyacın anlaşıldı",
    description: "Yazdığın kullanım amacı ve beklentiler karar kriterlerine çevriliyor.",
    completedText: "Kullanım senaryon karar kriterlerine çevrildi.",
    from: 0,
    to: 1,
    icon: UserRoundSearch,
  },
  {
    title: "Ürün ve güven sinyalleri inceleniyor",
    doneTitle: "Ürün ve güven sinyalleri incelendi",
    description:
      "Yorumlar, fiyat geçmişi, ürün açıklaması, görseller ve iade sebepleri kontrol ediliyor.",
    completedText:
      "Yorum, fiyat, listeleme ve iade kanıtları aynı karar dosyasında toplandı.",
    from: 1,
    to: 6,
    icon: FileSearch,
  },
  {
    title: "Karar raporu doğrulanıyor",
    doneTitle: "Karar raporu doğrulandı",
    description:
      "Skorlar hesaplanıyor, kanıtsız iddialar eleniyor ve kişisel tavsiye hazırlanıyor.",
    completedText: "Rapor sadece doğrulanmış bulgularla hazırlandı.",
    from: 6,
    to: 9,
    icon: FileCheck2,
  },
];

const liveFindings = [
  { threshold: 2, text: "Ürün açıklaması ve özellikleri incelendi", tone: "success" },
  { threshold: 3, text: "Yorumlardan tekrar eden risk başlıkları çıkarıldı", tone: "success" },
  { threshold: 5, text: "Fiyat ve pazar sinyalleri karşılaştırıldı", tone: "warning" },
  { threshold: 6, text: "İade sebepleri kullanım senaryonla eşleştirildi", tone: "warning" },
  { threshold: 8, text: "Kanıtsız iddialar rapordan elendi", tone: "success" },
] as const;

type AgentNodeData = AgentStep & {
  state: "pending" | "active" | "completed";
};

type StageNodeData = {
  title: string;
  doneTitle: string;
  description: string;
  completedText: string;
  state: "pending" | "active" | "completed";
  index: number;
  icon: (typeof decisionStages)[number]["icon"];
};

function getStageState(stage: (typeof decisionStages)[number], completed: number) {
  if (completed >= stage.to) {
    return "completed";
  }

  if (completed >= stage.from) {
    return "active";
  }

  return "pending";
}

function AgentNode({ data }: NodeProps<Node<AgentNodeData>>) {
  const Icon = iconByType[data.type];

  return (
    <div
      className={cn(
        "w-[235px] rounded-xl border bg-white p-4 shadow-sm transition",
        data.state === "completed" && "border-[#86EFAC] bg-[#F0FDF4]",
        data.state === "active" && "border-[#A78BFA] bg-[#F5F3FF] shadow-md",
        data.state === "pending" && "border-[#E5E7EB]",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#CBD5E1]" />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            data.state === "completed" && "bg-[#16A34A] text-white",
            data.state === "active" && "bg-[#5B2EFF] text-white",
            data.state === "pending" && "bg-[#F1F5F9] text-[#64748B]",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold leading-5 text-[#111827]">
            {data.label}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">
            {data.state === "completed" ? data.summary : data.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-bold">
        {data.state === "completed" ? (
          <>
            <CheckCircle2 className="size-4 text-[#16A34A]" />
            <span className="text-[#166534]">Kanıt üretildi</span>
          </>
        ) : data.state === "active" ? (
          <>
            <Loader2 className="size-4 animate-spin text-[#5B2EFF]" />
            <span className="text-[#5B2EFF]">Çalışıyor</span>
          </>
        ) : (
          <>
            <Circle className="size-4 text-[#94A3B8]" />
            <span className="text-[#64748B]">Sırada</span>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#CBD5E1]" />
    </div>
  );
}

function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
  const Icon = data.icon;

  return (
    <div
      className={cn(
        "w-[300px] rounded-xl border bg-white p-5 shadow-sm transition",
        data.state === "completed" && "border-[#BBF7D0] bg-[#F0FDF4]",
        data.state === "active" && "border-[#DDD6FE] bg-[#F5F3FF] shadow-md",
        data.state === "pending" && "border-[#E5E7EB]",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#CBD5E1]" />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            data.state === "completed" && "bg-[#16A34A] text-white",
            data.state === "active" && "bg-[#5B2EFF] text-white",
            data.state === "pending" && "bg-[#F1F5F9] text-[#64748B]",
          )}
        >
          {data.state === "completed" ? (
            <CheckCircle2 className="size-6" />
          ) : data.state === "active" ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Icon className="size-6" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-[#64748B]">
              {data.index + 1}. Aşama
            </span>
            {data.state === "active" ? (
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#5B2EFF]">
                İşleniyor
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-base font-extrabold leading-5 text-[#111827]">
            {data.state === "completed" ? data.doneTitle : data.title}
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#64748B]">
            {data.state === "completed" ? data.completedText : data.description}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#CBD5E1]" />
    </div>
  );
}

function EvidenceEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, markerEnd, data } = props;
  const path = `M ${sourceX},${sourceY} C ${sourceX + 90},${sourceY} ${
    targetX - 90
  },${targetY} ${targetX},${targetY}`;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: data?.active ? "#5B2EFF" : "#CBD5E1",
          strokeWidth: data?.active ? 2.5 : 1.5,
        }}
      />
      {data?.active ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute rounded-full border border-[#DDD6FE] bg-white px-2 py-1 text-[11px] font-bold text-[#5B2EFF] shadow-sm"
            style={{
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
            }}
          >
            sinyal
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const nodeTypes = { agent: AgentNode, stage: StageNode };
const edgeTypes = { evidence: EvidenceEdge };

export function BuyerAnalysisStepper({
  agentSteps,
  userNeedText,
  onComplete,
}: {
  agentSteps: AgentStep[];
  userNeedText: string;
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [traceVisible, setTraceVisible] = useState(false);

  useEffect(() => {
    if (currentIndex >= agentSteps.length) {
      const completeTimer = window.setTimeout(onComplete, 650);
      return () => window.clearTimeout(completeTimer);
    }

    const duration = agentSteps[currentIndex]?.durationMs ?? 850;
    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => index + 1);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [agentSteps, currentIndex, onComplete]);

  const completed = Math.min(currentIndex, agentSteps.length);
  const progress = Math.min((completed / agentSteps.length) * 100, 100);
  const activeStep = agentSteps[Math.min(currentIndex, agentSteps.length - 1)];

  const nodes = useMemo<Node<AgentNodeData>[]>(
    () =>
      agentSteps.map((step, index) => ({
        id: step.id,
        type: "agent",
        position: positions[step.id] ?? { x: index * 280, y: 120 },
        data: {
          ...step,
          state:
            index < currentIndex
              ? "completed"
              : index === currentIndex
                ? "active"
                : "pending",
        },
      })),
    [agentSteps, currentIndex],
  );

  const stageNodes = useMemo<Node<StageNodeData>[]>(
    () =>
      decisionStages.map((stage, index) => ({
        id: `stage-${index}`,
        type: "stage",
        position: stagePositions[index],
        data: {
          ...stage,
          index,
          state: getStageState(stage, completed),
        },
      })),
    [completed],
  );

  const edges = useMemo<Edge[]>(
    () =>
      edgePairs.map(([source, target]) => {
        const sourceIndex = agentSteps.findIndex((step) => step.id === source);
        return {
          id: `${source}-${target}`,
          source,
          target,
          type: "evidence",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#CBD5E1" },
          data: { active: sourceIndex > -1 && sourceIndex < currentIndex },
        };
      }),
    [agentSteps, currentIndex],
  );

  const stageEdges = useMemo<Edge[]>(
    () =>
      stageEdgePairs.map(([source, target], index) => ({
        id: `${source}-${target}`,
        source,
        target,
        type: "evidence",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#CBD5E1" },
        data: { active: completed >= decisionStages[index].to },
      })),
    [completed],
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#5B2EFF]">
              <Sparkles className="size-4" />
              Zekai Karar Motoru
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827]">
              Ürün senin ihtiyacına göre değerlendiriliyor
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Sistem önce ihtiyacını anlıyor, sonra ürünün güven ve risk
              kanıtlarını topluyor, en sonda doğrulanmış bulgularla kişisel
              karar raporunu hazırlıyor.
            </p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm">
            <p className="font-extrabold text-[#111827]">Kullanım senaryon</p>
            <p className="mt-1 max-w-md leading-6 text-[#6B7280]">
              {userNeedText}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Progress value={progress} className="h-2 bg-[#EEF2F7]" />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="p-5 md:p-6">
          <div className="h-[300px] min-w-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
            <ReactFlow
              nodes={stageNodes}
              edges={stageEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              minZoom={0.5}
              maxZoom={1.05}
              nodesDraggable={false}
              nodesConnectable={false}
              panOnDrag={false}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#E2E8F0" gap={18} />
            </ReactFlow>
          </div>

          <button
            type="button"
            onClick={() => setTraceVisible((visible) => !visible)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-bold text-[#111827] transition hover:border-[#C4B5FD] hover:text-[#5B2EFF]"
          >
            Teknik akışı görüntüle
            <ChevronDown
              className={cn("size-4 transition", traceVisible && "rotate-180")}
            />
          </button>
        </div>

        <aside className="border-t border-[#E5E7EB] p-5 lg:border-l lg:border-t-0">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
              <FileSearch className="size-4 text-[#FF6000]" />
              Canlı bulgular
            </div>
            <p className="mt-3 text-sm font-bold leading-6 text-[#111827]">
              {completed >= agentSteps.length
                ? "Karar raporu hazır"
                : activeStep?.summary}
            </p>
          </div>

          <div className="mt-4 grid gap-3 text-sm">
            {liveFindings.map((finding) => {
              const revealed = completed >= finding.threshold;
              const warning = finding.tone === "warning";

              return (
                <div
                  key={finding.text}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 font-semibold",
                    revealed && !warning && "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
                    revealed && warning && "border-[#FCD34D] bg-[#FFFBEB] text-[#92400E]",
                    !revealed && "border-[#E5E7EB] bg-white text-[#94A3B8]",
                  )}
                >
                  {revealed ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0" />
                  )}
                  <span>{finding.text}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {traceVisible ? (
        <div className="border-t border-[#E5E7EB] bg-[#F8FAFC]">
          <div className="border-b border-[#E5E7EB] px-5 py-4 md:px-6">
            <h3 className="font-extrabold text-[#111827]">Agent Trace</h3>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              Demo görünümü: arkadaki uzman ajanlar ve araç çıktıları.
            </p>
          </div>
          <div className="h-[430px] min-w-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              minZoom={0.45}
              maxZoom={1}
              nodesDraggable={false}
              nodesConnectable={false}
              panOnDrag={false}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#E2E8F0" gap={18} />
            </ReactFlow>
          </div>
        </div>
      ) : null}
    </section>
  );
}
