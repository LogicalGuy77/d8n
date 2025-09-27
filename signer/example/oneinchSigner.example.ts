//@ts-nocheck
import { buildWorkflowForSwap } from "../workflowbuilders/oneInchFlow";
import { executeWorkflow } from "../src/signer"; // <- your helper
import * as dotenv from "dotenv";
import { sepolia } from "viem/chains";

dotenv.config();

async function main() {
  // 🔑 env vars
  const PRIVATE_KEY = process.env.USER_PRIVATE_KEY!;
  const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL!;
  const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY!;
  const DELEGATE_CONTRACT_ADDRESS = "0xYourDelegateContract";

  // 🪙 Sepolia tokens (example addresses, replace with real ones from explorers!)
  const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const USDT_SEPOLIA = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";

  // 1inch v6 router
  const ONEINCH_ROUTER = "0x1111111254fb6c44bac0bed2854e76f90643097d";

  // Amount: 1 USDC (6 decimals)
  const amount = 1_000_000n;

  // 1️⃣ Build workflow
  const workflow = await buildWorkflowForSwap({
    chainId: 11155111, // Sepolia
    fromToken: USDC_SEPOLIA,
    toToken: USDT_SEPOLIA,
    amount,
    delegateAddress: DELEGATE_CONTRACT_ADDRESS,
    routerAddress: ONEINCH_ROUTER,
    apiKey: ONEINCH_API_KEY,
    slippage: 1 // 1% max slippage
  });

  console.log("Workflow:", workflow);
  const wf = {
    actions: workflow
  }

  // 2️⃣ Execute workflow via Delegate
  try {
    const txHash = await executeWorkflow({
      privateKey: PRIVATE_KEY,
      wf,
      chain: sepolia,
      rpcUrl: SEPOLIA_RPC_URL,
      delegateContractAddress: DELEGATE_CONTRACT_ADDRESS
    });

    console.log(`\n✅ Swap executed!`);
    console.log(`   Tx Hash: ${txHash}`);
    console.log(`   Explorer: https://sepolia.etherscan.io/tx/${txHash}`);
  } catch (err) {
    console.error("\n❌ Swap failed", err);
  }
}

main();
