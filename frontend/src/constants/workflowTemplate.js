import { tokens } from "./tokenMappings";
/**
 * Template 1: Simple "Buy the Dip" Strategy
 * Description: Monitors the price of ETH/USD. If the price drops below a
 * specified target ($4,500), it executes a swap from a stablecoin (USDC) to ETH.
 */
export const buyTheDipTemplate = {
  name: "Buy The Dip (WETH)",
  description: "Swaps USDC for WETH when the price drops below $4,500.",
  nodes: [
    {
      id: "pyth-1",
      type: "pyth-network",
      position: { x: 50, y: 150 },
      data: {
        label: "Pyth Price Feed",
        node_data: { symbol: "ETH_USD" },
      },
    },
    {
      id: "condition-1",
      type: "condition",
      position: { x: 350, y: 150 },
      data: {
        label: "Price < $4,500?",
        node_data: { condition: "price < 4500" },
      },
    },
    {
      id: "swap-1",
      type: "swap",
      position: { x: 650, y: 100 },
      data: {
        label: "Swap USDC to WETH",
        node_data: {
          tokenIn: tokens.USDC.address,
          tokenOut: tokens.WETH.address,
          amountIn: "1000000", // 10 USDC with 6 decimals
          amountOutMin: "0",
        },
      },
    },
    {
      id: "print-1",
      type: "print",
      position: { x: 650, y: 250 },
      data: {
        label: "Print: No Action",
        node_data: { sample: "Price is above threshold. No action taken." },
      },
    },
  ],
  edges: [
    {
      id: "e1-2",
      source: "pyth-1",
      target: "condition-1",
      sourceHandle: "price",
      targetHandle: "price",
    },
    {
      id: "e2-3",
      source: "condition-1",
      target: "swap-1",
      sourceHandle: "true-path",
      targetHandle: "activate",
      label: "True",
    },
    {
      id: "e2-4",
      source: "condition-1",
      target: "print-1",
      sourceHandle: "false-path",
      targetHandle: "test",
      label: "False",
    },
  ],
};

/**
 * Template 2: Payroll Executor
 * Description: Queries wallet balance and conditionally sends tokens to multiple recipients
 * based on balance conditions. Used for automated payroll distribution.
 */
export const takeProfitTemplate = {
  name: "Payroll Executor",
  description:
    "Queries balance and sends tokens to multiple recipients based on conditions.",
  nodes: [
    {
      id: "2",
      type: "queryBalance",
      position: { x: -26.175446148147614, y: 4.589882602126821 },
      data: {
        label: "Query balance",
        node_data: {
          tokenAddress: "",
          walletAddress: "0x8a453B41c6E454D5b3152f32908Bc9A0DDa689B4",
        },
      },
    },
    {
      id: "3",
      type: "condition",
      position: { x: 262.0481571871899, y: 71.09010289220775 },
      data: {
        label: "Condition",
        node_data: { condition: "price > 0.2" },
      },
    },
    {
      id: "4",
      type: "sendToken",
      position: { x: 643.5793536980883, y: -71.93722709194532 },
      data: {
        label: "Send Token to any address",
        node_data: {
          tokenAddress: "",
          destination: "0xa9aaC8b17F7fb7dF0104ECd53F8b635b8052b97E",
          amount: "0.001",
        },
      },
    },
    {
      id: "5",
      type: "sendToken",
      position: { x: 639.5870948696503, y: 97.32078227214592 },
      data: {
        label: "Send Token to any address",
        node_data: {
          tokenAddress: "",
          destination: "0xaa8A4A0df322aB0a1B5D623450ee1d426aC43C2F",
          amount: "0.001",
        },
      },
    },
    {
      id: "7",
      type: "sendToken",
      position: { x: 644.3980511109968, y: 277.34098178853526 },
      data: {
        label: "Send Token to any address",
        node_data: {
          tokenAddress: "",
          destination: "0xaa8A4A0df322aB0a1B5D623450ee1d426aC43C2F",
          amount: "0.001",
        },
      },
    },
  ],
  edges: [
    {
      id: "e2-3",
      source: "2",
      target: "3",
      sourceHandle: "balance",
      targetHandle: "price",
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      sourceHandle: "true-path",
      targetHandle: "activate",
      label: "True",
    },
    {
      id: "e3-5",
      source: "3",
      target: "5",
      sourceHandle: "true-path",
      targetHandle: "activate",
      label: "True",
    },
    {
      id: "e3-7",
      source: "3",
      target: "7",
      sourceHandle: "true-path",
      targetHandle: "activate",
      label: "True",
    },
  ],
};

/**
 * Template 3: Simple Limit Order Strategy
 * Description: Monitors the price of BTC/USD and places a limit order to buy INCH
 * when the price is above $50,000. This demonstrates a basic limit order workflow.
 */
export const priceRangeAlertTemplate = {
  name: "Simple Limit Order (INCH)",
  description:
    "Places a limit order to buy INCH when BTC price is above $50,000.",
  nodes: [
    {
      id: "pyth-1",
      type: "pyth-network",
      position: { x: 50, y: 150 },
      data: {
        label: "Pyth Price Feed",
        node_data: { symbol: "BTC_USD" },
      },
    },
    {
      id: "condition-1",
      type: "condition",
      position: { x: 350, y: 150 },
      data: {
        label: "Price > $50000?",
        node_data: { condition: "price > 50000" },
      },
    },
    {
      id: "limitOrder-1",
      type: "limitOrder",
      position: { x: 650, y: 100 },
      data: {
        label: "Buy INCH Limit Order",
        node_data: {
          makerToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          takerToken: "0xc5fecC3a29Fb57B5024eEc8a2239d4621e111CBE",
          makingAmount: "1",
          takingAmount: "4",
        },
      },
    },
    {
      id: "print-1",
      type: "print",
      position: { x: 650, y: 250 },
      data: {
        label: "Print: No Order",
        node_data: {
          sample: "Price is above threshold. No limit order placed.",
        },
      },
    },
  ],
  edges: [
    {
      id: "e1-2",
      source: "pyth-1",
      target: "condition-1",
      sourceHandle: "price",
      targetHandle: "price",
    },
    {
      id: "e2-3",
      source: "condition-1",
      target: "limitOrder-1",
      sourceHandle: "true-path",
      targetHandle: "activate",
      label: "True",
    },
    {
      id: "e2-4",
      source: "condition-1",
      target: "print-1",
      sourceHandle: "false-path",
      targetHandle: "test",
      label: "False",
    },
  ],
};
