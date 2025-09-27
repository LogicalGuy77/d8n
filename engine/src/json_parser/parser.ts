import type { WorkflowSchema } from "../schema/WorkflowSchema.js";
import { ConditionNode } from "../components/ConditionNode.js";
import { PythNode } from "../components/PythNode.js";
import { PrintNode } from "../components/PrintNode.js";
import { UniswapNode } from "../components/UniswapNode.js";
import { sendTokenNode } from "../components/sendTokenNode.js";
import { QueryBalanceNode } from "../components/QueryBalanceNode.js";
import { LimitOrderNode } from "../components/LimitOrderNode.js";
import { Workflow } from "../components/Workflow.js";
import type { Edges } from "../interfaces/Edges.js";
import type { Node } from "../interfaces/Node.js";

export function parse_workflow(json_workflow: WorkflowSchema) {
  const type: string = json_workflow.type;
  const nodes: Record<string, Node> = {};
  const edges: Edges = json_workflow.edges;

  //Parse nodes
  for (const [id, schema] of Object.entries(json_workflow.nodes)) {
    const nodeData = schema.node_data ?? {};
    switch (schema.type) {
      case "pyth-network":
        nodes[id] = new PythNode(id, schema.label, nodeData.symbol);
        break;
      case "condition":
        nodes[id] = new ConditionNode(
          id,
          schema.label,
          schema.inputs,
          nodeData.condition
        );
        break;
      case "print":
        nodes[id] = new PrintNode(id, schema.label, schema.inputs);
        break;
      case "swap":
        nodes[id] = new UniswapNode(id, schema.label, nodeData.tokenIn, nodeData.tokenOut, BigInt(nodeData.amountIn), BigInt(nodeData.amountOutMin));
        break;
      case "sendToken":
        nodes[id] = new sendTokenNode(id, schema.label, nodeData.tokenAddress, nodeData.destination, nodeData.amount);
        break;
      case "queryBalance":
        nodes[id] = new QueryBalanceNode(id, schema.label, nodeData.tokenAddress, nodeData.walletAddress);
        break;
      case "limitOrder":
        nodes[id] = new LimitOrderNode(id, schema.label, nodeData.makerToken, nodeData.takerToken, nodeData.makingAmount, nodeData.takingAmount);
        break;
      default:
        console.warn(`Unknown node type: ${schema.type} at node ${id}`);
    }
  }

  return new Workflow(type, nodes, edges);
}
