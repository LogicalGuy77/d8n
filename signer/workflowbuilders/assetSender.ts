//@ts-nocheck
import {
  createWalletClient,
  http,
  parseEther,
  encodeFunctionData,
  Hex,
  Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain, sepolia } from "viem/chains";

import * as dotenv from "dotenv";
dotenv.config();
// ---------------------------
// ERC20 Minimal ABI
// ---------------------------
const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
];

// ---------------------------
// Helpers
// ---------------------------
function getWalletClient(rpcUrl: string, chain: Chain, privateKey: Hex) {
  const account = privateKeyToAccount(privateKey);
  const transport = http(rpcUrl);

  return createWalletClient({ account, chain, transport });
}

// ---------------------------
// Native Token Transfer (ETH, MATIC, etc.)
// ---------------------------
export async function sendNativeToken({
  chain,
  rpcUrl,
  privateKey,
  to,
  amount,
}: {
  chain: Chain;
  rpcUrl: string;
  privateKey: Hex;
  to: string;
  amount: string; // ether units
}) {
  const walletClient = getWalletClient(rpcUrl, chain, privateKey);

  const hash = await walletClient.sendTransaction({
    to : to as Address,
    value: parseEther(amount),
  });

  return { txHash: hash };
}

// ---------------------------
// ERC20 Token Transfer
// ---------------------------
export async function sendERC20Token({
  chain,
  rpcUrl,
  privateKey,
  tokenAddress,
  to,
  amount,
}: {
  chain: Chain;
  rpcUrl: string;
  privateKey: Hex;
  tokenAddress: string;
  to: string;
  amount: bigint; // raw token units (not ether units!)
}) {
  const walletClient = getWalletClient(rpcUrl, chain, privateKey);

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  });

  const hash = await walletClient.sendTransaction({
    to: tokenAddress as Address,
    data,
  });

  return { txHash: hash };
}

// ---------------------------
// Example Usage
// ---------------------------
async function main() {
  const PRIVATE_KEY = process.env.USER_PRIVATE_KEY; // replace with user's private key
  const RPC_URL = process.env.SEPOLIA_RPC_URL; // replace with your RPC URL

  const sepoliaChain: Chain = {
    id: 11155111,
    name: "Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  };

  // Send 0.01 ETH
  const res1 = await sendNativeToken({
    chain: sepolia,
    rpcUrl: RPC_URL,
    privateKey: PRIVATE_KEY,
    to: "0xa9aaC8b17F7fb7dF0104ECd53F8b635b8052b97E",
    amount: "0.01",
  });
  console.log("✅ Native Tx:", res1.txHash);

  // Send ERC20 tokens
  const res2 = await sendERC20Token({
    chain: sepolia,
    rpcUrl: RPC_URL,
    privateKey: PRIVATE_KEY,
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    to: "0xa9aaC8b17F7fb7dF0104ECd53F8b635b8052b97E",
    amount: 10n * 10n ** 6n, // 10 tokens (if 18 decimals)
  });
  console.log("✅ ERC20 Tx:", res2.txHash);
}

main().catch(console.error);

