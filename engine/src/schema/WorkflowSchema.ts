import type { NodeSchema } from "./NodeSchema.js";
import type { EdgesSchema } from "./EdgeSchema.js";

export interface WorkflowSchema {
    type: "once" | "repeat";
    nodes: Record<string, NodeSchema>,
    edges: EdgesSchema
}