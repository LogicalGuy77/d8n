import { tokens } from "./tokenMappings";
/**
 * Template 1: Simple "Buy the Dip" Strategy
 * Description: Monitors the price of ETH/USD. If the price drops below a
 * specified target ($3,200), it executes a swap from a stablecoin (USDC) to ETH.
 */
export const buyTheDipTemplate = {
  name: "Buy The Dip (WETH)",
  description: "Swaps USDC for WETH when the price drops below $3,200.",
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
        label: "Price > $3,200?",
        node_data: { condition: "price > 3200" },
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
 * Template 2: Simple "Take Profit" Strategy
 * Description: Monitors the price of BTC/USD. If the price rises above a
 * specified target ($75,000), it executes a swap from BTC to a stablecoin (USDC).
 */
export const takeProfitTemplate = {
  name: "Take Profit (DAI)",
  description: "Swaps USDC for DAI when the price goes above $75,000.",
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
        label: "Price > $75,000?",
        node_data: { condition: "price > 75000" },
      },
    },
    {
      id: "swap-1",
      type: "swap",
      position: { x: 650, y: 150 },
      data: {
        label: "Swap USDC to DAI",
        node_data: {
          tokenIn: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          tokenOut: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
          amountIn: "10000000",
          amountOutMin: "0",
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
      target: "swap-1",
      sourceHandle: "true-path",
      targetHandle: "activate",
      label: "True",
    },
  ],
};

/**
 * Template 3: Price Range Alert
 * Description: A non-trading workflow that checks if the price of SOL is
 * outside a defined range (e.g., $120 - $180) and logs a message.
 * This demonstrates multi-condition logic.
 */
export const priceRangeAlertTemplate = {
  name: "Price Range Alert (SOL)",
  description:
    "Logs a message if the price of SOL moves outside the $120-$180 range.",
  nodes: [
    {
      id: "pyth-1",
      type: "pyth-network",
      position: { x: 50, y: 200 },
      data: {
        label: "Pyth Price Feed",
        node_data: { symbol: "SOL_USD" },
      },
    },
    {
      id: "condition-high",
      type: "condition",
      position: { x: 350, y: 100 },
      data: {
        label: "Price > $180?",
        node_data: { condition: "price > 180" },
      },
    },
    {
      id: "condition-low",
      type: "condition",
      position: { x: 350, y: 300 },
      data: {
        label: "Price < $120?",
        node_data: { condition: "price < 120" },
      },
    },
    {
      id: "print-high",
      type: "print",
      position: { x: 650, y: 100 },
      data: {
        label: "Print: High Alert",
        node_data: { sample: "SOL price is above the target range!" },
      },
    },
    {
      id: "print-low",
      type: "print",
      position: { x: 650, y: 300 },
      data: {
        label: "Print: Low Alert",
        node_data: { sample: "SOL price is below the target range!" },
      },
    },
  ],
  edges: [
    {
      id: "e1-ch",
      source: "pyth-1",
      target: "condition-high",
      sourceHandle: "price",
      targetHandle: "price",
    },
    {
      id: "e1-cl",
      source: "pyth-1",
      target: "condition-low",
      sourceHandle: "price",
      targetHandle: "price",
    },
    {
      id: "ech-ph",
      source: "condition-high",
      target: "print-high",
      sourceHandle: "true-path",
      targetHandle: "test",
      label: "True",
    },
    {
      id: "ecl-pl",
      source: "condition-low",
      target: "print-low",
      sourceHandle: "true-path",
      targetHandle: "test",
      label: "True",
    },
    {
      id: "e1-ph",
      source: "pyth-1",
      target: "print-high",
      sourceHandle: "price",
      targetHandle: "test",
    },
    {
      id: "e1-pl",
      source: "pyth-1",
      target: "print-low",
      sourceHandle: "price",
      targetHandle: "test",
    },
  ],
};
