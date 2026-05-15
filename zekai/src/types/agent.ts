export type AgentStatus = "idle" | "running" | "completed" | "failed";

export type AgentNode = {
  id: string;
  label: string;
  status: AgentStatus;
  summary?: string;
};
