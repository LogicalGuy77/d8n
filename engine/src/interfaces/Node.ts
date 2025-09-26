export interface Node{
    id: string;
    label: string;
    type: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    execute(): void | Promise<void>;
}