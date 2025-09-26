import type { Node } from '../interfaces/Node.js';
import { Parser } from 'expr-eval';

export class ConditionNode implements Node {
    id: string;
    label: string;
    type = "condition";
    inputs: Record<string, any> = {};
    outputs: { path: string | null } = { path: null };
    nodeData: { condition: string };

    constructor(id: string, label: string, inputs: Record<string, any>, nodeData: { condition: string }) {
        this.id = id;
        this.label = label;
        this.nodeData = nodeData;
        this.inputs = inputs;
    }

    execute() {
        const parser = new Parser();
        const expr = parser.parse(this.nodeData.condition);

        const result = expr.evaluate(this.inputs);

        this.outputs.path = result ? "true-path" : "false-path";
    }
}
