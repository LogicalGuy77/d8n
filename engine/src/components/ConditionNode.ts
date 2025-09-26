import type { Node } from '../interfaces/Node.js';
import { Parser } from 'expr-eval';

export class ConditionNode implements Node {
    id: string;
    label: string;
    type = "condition";
    inputs: Record<string, any> = {};
    outputs: { path: string | null } = { path: null };
    condition: string;

    constructor(id: string, label: string, inputs: Record<string, any>, condition: string) {
        this.id = id;
        this.label = label;
        this.condition = condition;
        this.inputs = inputs;
    }

    execute() {
        const parser = new Parser();
        const expr = parser.parse(this.condition);

        const result = expr.evaluate(this.inputs);

        this.outputs.path = result ? "true-path" : "false-path";
    }
}
