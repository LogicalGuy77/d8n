export interface EdgesSchema {
    [fromNodeId: string]: {
        [toNodeId: string]: Record<string, string>
    }
}