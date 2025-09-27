import type { Node } from "../interfaces/Node.js";
import type { Edges } from "../interfaces/Edges.js";

export class Workflow {
    type: string = "";
    nodes: Record<string, Node> = {};
    edges: Edges;

    constructor(type: string, nodes: Record<string, Node>, edges: Edges) {
        if(type === "once" || type === "repeat") this.type = type;
        else{
            console.log("Type not specified");
        }
        this.edges = edges;
        this.nodes = nodes;
    }

    async run() {
        // Step 1: Build in-degree map for all nodes
        const inDegree: Record<string, number> = {};
        for (const id of Object.keys(this.nodes)) {
            inDegree[id] = 0;
        }

        for (const from in this.edges) {
            for (const to in this.edges[from]) {
                if (inDegree[to] === undefined) {
                    inDegree[to] = 0;
                }
                inDegree[to] += 1;
            }
        }

        // Step 2: Initialize queue with nodes having in-degree 0
        const queue: string[] = Object.keys(inDegree).filter((id) => inDegree[id] === 0);

        // Step 3: Process queue
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const currentNode = this.nodes[currentId];

            if (!currentNode) continue;

            // Execute the node
            await currentNode.execute();

            // Step 4: Wire outputs to downstream nodes
            if (this.edges[currentId]) {
                for (const [toNodeId, mapping] of Object.entries(this.edges[currentId])) {
                    let shouldActivate = true;

                    // Handle condition nodes: only continue along the chosen path
                    if (currentNode.type === "condition") {
                        const chosenPath = currentNode.outputs.path;
                        // mapping has keys like { "true-path": "activate" }
                        const mappingKeys = Object.keys(mapping);
                        if (!mappingKeys.includes(chosenPath!)) {
                            shouldActivate = false;
                        }
                    }

                    if (shouldActivate) {
                        const targetNode = this.nodes[toNodeId];
                        if (targetNode) {
                            for (const [fromOutput, toInput] of Object.entries(mapping)) {
                                if (currentNode.outputs[fromOutput] !== undefined) {
                                    targetNode.inputs[toInput] = currentNode.outputs[fromOutput];
                                }
                            }
                        }

                        // Step 5: Reduce in-degree and enqueue if ready (only for active paths)
                        inDegree[toNodeId] = (inDegree[toNodeId] ?? 0) - 1;
                        if (inDegree[toNodeId] === 0) {
                            queue.push(toNodeId);
                        }
                    }
                }
            }
        }
    }

    async start() {
        await this.run();
        while(this.type === "repeat"){
            await this.run();
        }
    }
}
