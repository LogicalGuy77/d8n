// Node configuration for workflow components
export const NODE_CONFIG = {
  "pyth-network": {
    label: "Pyth Price Feed",
    inputs: { activate: { type: "bool" } },
    outputs: { price: { type: "float" } },
    node_data: { symbol: "BTC_USD" },
  },
  limitOrder: {
    label: "1inch Limit Order",
    inputs: { activate: { type: "bool" } },
    outputs: {},
    node_data: {
      makerToken: "",
      takerToken: "",
      makingAmount: "",
      takingAmount: "",
    },
  },
  queryBalance: {
    label: "Query balance",
    inputs: { activate: { type: "bool" } },
    outputs: {
      balance: 0,
    },
    node_data: {
      tokenAddress: "",
      walletAddress: "",
    },
  },
  sendToken: {
    label: "Send Token to any address",
    inputs: { activate: { type: "bool" } },
    outputs: { txHash: { type: "string" } },
    node_data: {
      tokenAddress: "",
      destination: "",
      amount: "",
    },
  },
  condition: {
    label: "Condition",
    inputs: { price: { type: "float" } },
    outputs: { "true-path": { type: "bool" }, "false-path": { type: "bool" } },
    node_data: { condition: "price > 100000" },
  },
  swap: {
    label: "1inch Swap",
    inputs: { activate: { type: "bool" } },
    outputs: {},
    node_data: {
      tokenIn: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      tokenOut: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
      amountIn: "10000000",
      amountOutMin: "0",
    },
  },
  print: {
    label: "Print Debug",
    inputs: { test: { type: "float" } },
    outputs: {},
    node_data: { sample: "sample" },
  },
};
