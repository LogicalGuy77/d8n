import type { NodeSchema } from "./NodeSchema.js";
import type { EdgesSchema } from "./EdgeSchema.js";

export interface WorkflowSchema {
    walletaddr: string;
    type: "once" | "repeat";
    nodes: Record<string, NodeSchema>,
    edges: EdgesSchema
}