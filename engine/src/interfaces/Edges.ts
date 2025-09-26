export interface Edges {
    [fromNodeId: string]: {
        [toNodeId: string]: Record<string, string>;
    };
}