import type { Node } from '../interfaces/Node.js';

export class PrintNode implements Node {
    id: string;
    label: string;
    type = "print";
    inputs: Record<string, any> = {};
    outputs: Record<string, any> = {}

    constructor(id: string, label: string, inputs: Record<string, any>) {
        this.id = id;
        this.label = label;
        this.inputs = inputs;
    }

    execute() {
        for(const[input_name, input_value] of Object.entries(this.inputs)){
            console.log(`[${input_name}]: ${JSON.stringify(input_value)}`);
        }
    }
}
