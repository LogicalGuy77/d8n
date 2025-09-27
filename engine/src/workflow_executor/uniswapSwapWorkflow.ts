// src/uniswapV2Sdk.ts
// @ts-nocheck
import {
  createWalletClient,
  createPublicClient,
  http,
  encodeFunctionData,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Chain } from "viem/chains";

export interface UniswapV2SwapOptions {
  privateKey: Hex;         // 0x-prefixed user's private key
  chain: Chain;            // viem Chain (e.g., sepolia)
  rpcUrl: string;          // RPC endpoint for the chain
  routerAddress: Address;  // Uniswap V2-compatible router address
  tokenIn: Address;        // token to sell
  tokenOut: Address;       // token to buy
  amountIn: bigint;        // raw amountIn (token decimals applied by caller)
  amountOutMin?: bigint;   // minimum tokenOut expected (recommended)
  slippageBps?: number;    // alternatively provide slippage in basis points (e.g., 100 = 1%)
  recipient?: Address;     // recipient of tokenOut, default = signer address
  deadlineSeconds?: number; // seconds from now for deadline (default 20m)
  approveMax?: boolean;    // if true, approve max uint256 instead of exact amountIn
}

// Minimal ERC20 ABI for read/write operations
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "remaining", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

// Minimal Uniswap V2 Router ABI for swapExactTokensForTokens
const uniswapV2RouterAbi = [
  {
    name: "swapExactTokensForTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
];

const UINT256_MAX = (BigInt(1) << BigInt(256)) - BigInt(1);

export async function uniswapV2Swap(options: UniswapV2SwapOptions): Promise<string> {
  const {
    privateKey,
    chain,
    rpcUrl,
    routerAddress,
    tokenIn,
    tokenOut,
    amountIn,
    amountOutMin,
    slippageBps,
    recipient,
    deadlineSeconds = 60 * 20,
    approveMax = false,
  } = options;

  // Validate private key
  if (!privateKey || typeof privateKey !== "string" || !privateKey.startsWith("0x")) {
    throw new Error("Invalid privateKey. Must be a 0x-prefixed string.");
  }

  if (!amountIn || typeof amountIn !== "bigint") {
    throw new Error("amountIn must be provided as a bigint (raw token units).");
  }

  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const signerAddress = account.address;
  const toAddress = recipient ?? signerAddress;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);

  console.log("=== Uniswap V2 SDK Swap ===");
  console.log("User:", signerAddress);
  console.log("Router:", routerAddress);
  console.log("TokenIn:", tokenIn, "TokenOut:", tokenOut);
  console.log("AmountIn:", amountIn.toString());
  console.log("Recipient:", toAddress);
  console.log("Deadline (unix):", deadline.toString());

  // 1) Check balance
  const balance = (await publicClient.readContract({
    address: tokenIn,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [signerAddress],
  })) as bigint;

  if (balance < amountIn) {
    throw new Error(`Insufficient tokenIn balance: have ${balance}, need ${amountIn}`);
  }

  // 2) Check allowance
  const allowance = (await publicClient.readContract({
    address: tokenIn,
    abi: erc20Abi,
    functionName: "allowance",
    args: [signerAddress, routerAddress],
  })) as bigint;

  // Decide approve amount
  const approveAmount = approveMax ? UINT256_MAX : amountIn;

  if (allowance < amountIn) {
    console.log("Allowance insufficient. Sending approve tx...");

    const approveTxHash = await walletClient.writeContract({
      address: tokenIn,
      abi: erc20Abi,
      functionName: "approve",
      args: [routerAddress, approveAmount],
    });

    console.log("Approve tx submitted:", approveTxHash);
    console.log("Waiting for approval confirmation...");
    await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
    console.log("Approval confirmed.");
  } else {
    console.log("Allowance sufficient. Skipping approve.");
  }

  // 3) Compute amountOutMin
  let finalAmountOutMin = amountOutMin ?? 0n;
  if (!amountOutMin && slippageBps && typeof slippageBps === "number") {
    // We don't have a quote here. The user asked for slippage-based fallback.
    // Without a quote, we cannot compute a real amountOutMin. Warn the user.
    console.warn(
      "slippageBps provided but no quote available. Using amountOutMin = 0n. For safety, provide amountOutMin based on a quote."
    );
  }

  if (finalAmountOutMin === undefined) finalAmountOutMin = 0n;

  // 4) Build path (direct trade)
  const path = [tokenIn, tokenOut];

  // 5) Call swapExactTokensForTokens
  console.log("Calling swapExactTokensForTokens on router...");
  const swapTxHash = await walletClient.writeContract({
    address: routerAddress,
    abi: uniswapV2RouterAbi,
    functionName: "swapExactTokensForTokens",
    args: [amountIn, finalAmountOutMin, path, toAddress, deadline],
  });

  console.log("Swap tx submitted:", swapTxHash);
  return swapTxHash;
}
