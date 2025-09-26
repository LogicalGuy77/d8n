// Node configuration for workflow components
export const NODE_CONFIG = {
  "pyth-network": {
    label: "Pyth Price Feed",
    inputs: {},
    outputs: { price: { type: "float" } },
    "node-data": { symbol: "btc/usd" },
  },
  condition: {
    label: "Condition",
    inputs: { price: { type: "float" } },
    outputs: { "true-path": { type: "bool" }, "false-path": { type: "bool" } },
    "node-data": { condition: "price > 100000" },
  },
  swap: {
    label: "1inch Swap",
    inputs: { activate: { type: "bool" } },
    outputs: {},
    "node-data": { symbol: "btc", sender: "", receiver: "" },
  },
};
