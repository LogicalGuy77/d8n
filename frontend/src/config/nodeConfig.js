// Node configuration for workflow components
export const NODE_CONFIG = {
  "pyth-network": {
    label: "Pyth Price Feed",
    inputs: {},
    outputs: { price: { type: "float" } },
    "node_data": { symbol: "btc/usd" },
  },
  condition: {
    label: "Condition",
    inputs: { price: { type: "float" } },
    outputs: { "true-path": { type: "bool" }, "false-path": { type: "bool" } },
    "node_data": { condition: "price > 100000" },
  },
  swap: {
    label: "1inch Swap",
    inputs: { activate: { type: "bool" } },
    outputs: {},
    "node_data": { symbol: "btc", sender: "", receiver: "" },
  },
  print: {
    label: "Print Debug",
    inputs: { test: { type: "float"}},
    outputs: {},
    "node_data": {"sample": "sample"}
  }
};
