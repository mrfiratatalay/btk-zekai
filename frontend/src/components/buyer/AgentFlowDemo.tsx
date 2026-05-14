"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { AgentStep, AgentStepStatus } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AgentNodeData = {
  label: string;
  description: string;
  summary: string;
  status: AgentStepStatus;
};

const positions = [
  { x: 0, y: 0 },
  { x: 280, y: 0 },
  { x: 560, y: 0 },
  { x: 0, y: 170 },
  { x: 280, y: 170 },
  { x: 560, y: 170 },
  { x: 0, y: 340 },
  { x: 280, y: 340 },
  { x: 560, y: 340 },
];

function AgentNode({ data }: NodeProps<Node<AgentNodeData>>) {
  const isActive = data.status === "active";
  const isCompleted = data.status === "completed";

  return (
    <div
      className={cn(
        "w-60 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition",
        isActive &&
          "border-[#5B2EFF] shadow-md shadow-[#5B2EFF]/15 ring-4 ring-[#5B2EFF]/10",
        isCompleted && "border-[#BBF7D0] bg-[#F0FDF4]",
      )}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold leading-5 text-[#111827]">
            {data.label}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase text-[#6B7280]">
            {isCompleted ? "Tamamlandı" : isActive ? "Çalışıyor" : "Sırada"}
          </p>
        </div>
        {isCompleted ? (
          <CheckCircle2 className="size-5 shrink-0 text-[#16A34A]" />
        ) : isActive ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-[#5B2EFF]" />
        ) : (
          <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-[#D1D5DB]" />
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6B7280]">
        {isCompleted || isActive ? data.summary : data.description}
      </p>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}

const nodeTypes = {
  agent: AgentNode,
};

function buildEdges(steps: AgentStep[]): Edge[] {
  return steps.slice(0, -1).map((step, index) => ({
    id: `e-${step.id}-${steps[index + 1].id}`,
    source: step.id,
    target: steps[index + 1].id,
    animated: true,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8B5CF6" },
    style: { stroke: "#8B5CF6", strokeWidth: 2 },
  }));
}

export function AgentFlowDemo({
  steps,
  onComplete,
}: {
  steps: AgentStep[];
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= steps.length) {
      onComplete();
      return;
    }

    const timeout = window.setTimeout(() => {
      setCurrentIndex((index) => index + 1);
    }, steps[currentIndex].durationMs);

    return () => window.clearTimeout(timeout);
  }, [currentIndex, onComplete, steps]);

  const nodes = useMemo<Node<AgentNodeData>[]>(
    () =>
      steps.map((step, index) => ({
        id: step.id,
        type: "agent",
        position: positions[index],
        data: {
          label: step.label,
          description: step.description,
          summary: step.summary,
          status:
            index < currentIndex
              ? "completed"
              : index === currentIndex
                ? "active"
                : "pending",
        },
      })),
    [currentIndex, steps],
  );

  const edges = useMemo(() => buildEdges(steps), [steps]);
  const activeStep = steps[Math.min(currentIndex, steps.length - 1)];
  const completedCount = Math.min(currentIndex, steps.length);

  return (
    <Card className="overflow-hidden rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="space-y-3 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Agent çalışma akışı
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              İhtiyaç, ürün, yorum, fiyat ve iade sinyalleri sıralı ajanlarla
              işleniyor.
            </p>
          </div>
          <Badge className="rounded-full bg-[#5B2EFF] px-3 py-1 text-white">
            {completedCount}/{steps.length} tamamlandı
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0 md:p-6 md:pt-0">
        <div className="h-[520px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            nodesDraggable={false}
            nodesConnectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#E5E7EB" gap={20} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-4">
          <p className="text-sm font-medium text-[#6B7280]">Şu an çalışan adım</p>
          <p className="mt-1 font-bold text-[#111827]">
            {currentIndex >= steps.length ? "Akış hazır" : activeStep.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            {currentIndex >= steps.length ? "Ajan akışı tamamlandı." : activeStep.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
