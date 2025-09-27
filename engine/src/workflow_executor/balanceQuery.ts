//@ts-nocheck
import {
  createPublicClient,
  http,
  type Address,
  formatEther,
} from "viem";
import { type Chain } from "viem/chains";

// ---------------------------
// ERC20 Minimal ABI for balance query
// ---------------------------
const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "decimals", type: "uint8" }],
  },
];

// ---------------------------
// Helpers
// ---------------------------
function getPublicClient(rpcUrl: string, chain: Chain) {
  const transport = http(rpcUrl);
  return createPublicClient({ chain, transport });
}

// ---------------------------
// Native Token Balance Query (ETH, MATIC, etc.)
// ---------------------------
export async function queryNativeTokenBalance({
  chain,
  rpcUrl,
  walletAddress,
}: {
  chain: Chain;
  rpcUrl: string;
  walletAddress: string;
}) {
  const publicClient = getPublicClient(rpcUrl, chain);

  const balance = await publicClient.getBalance({
    address: walletAddress as Address,
  });

  // Return balance in both raw wei and formatted ether
  return {
    raw: balance.toString(),
    formatted: formatEther(balance),
  };
}

// ---------------------------
// ERC20 Token Balance Query
// ---------------------------
export async function queryERC20TokenBalance({
  chain,
  rpcUrl,
  tokenAddress,
  walletAddress,
}: {
  chain: Chain;
  rpcUrl: string;
  tokenAddress: string;
  walletAddress: string;
}) {
  const publicClient = getPublicClient(rpcUrl, chain);

  // Get balance
  const balance = await publicClient.readContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [walletAddress as Address],
  });

  // Get decimals for formatting
  const decimals = await publicClient.readContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "decimals",
    args: [],
  });

  // Format balance based on token decimals
  const formatted = (Number(balance) / Math.pow(10, Number(decimals))).toString();

  return {
    raw: balance.toString(),
    formatted: formatted,
    decimals: Number(decimals),
  };
}