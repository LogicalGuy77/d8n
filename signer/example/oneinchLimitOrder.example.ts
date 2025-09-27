//@ts-nocheck
import { buildWorkflowForLimitOrderAPI } from "../workflowbuilders/oneInchLimitOrder"; // the function we wrote
import { executeWorkflow, Workflow } from "../src/signer"; // your Delegator SDK
import dotenv from "dotenv";
import { sepolia } from "viem/chains";
import { Address } from "viem";

dotenv.config();

const SEPOLIA_CHAIN_ID = 11155111;
const DELEGATOR_CONTRACT = process.env.DELEGATOR_CONTRACT!;
const MAKER_PRIVATE_KEY = process.env.MAKER_PRIVATE_KEY!;
const API_KEY = process.env.ONEINCH_API_KEY!;
const RPC_URL = process.env.SEPOLIA_RPC_URL!;

async function runLimitOrderWorkflow() {
  // 1️⃣ Build workflow
  const workflow: Workflow = await buildWorkflowForLimitOrderAPI({
    makerPrivateKey: MAKER_PRIVATE_KEY,
    makerToken: "0xUSDC_SEPOLIA", // replace with actual token address
    takerToken: "0xUSDT_SEPOLIA", // replace with actual token address
    makingAmount: 1_000_000n,      // 1 USDC (6 decimals)
    takingAmount: 999_000n,        // 0.999 USDT
    delegateAddress: DELEGATOR_CONTRACT,
    apiKey: API_KEY,
    chainId: SEPOLIA_CHAIN_ID,
    oneInchOrderBookContractAddress : ''
  });

  console.log("✅ Limit Order Workflow built:", workflow);

  // 2️⃣ Execute workflow via Delegator
  try {
    const txHash = await executeWorkflow({
      privateKey: MAKER_PRIVATE_KEY,
      workflow,
      chain: sepolia,
      rpcUrl: RPC_URL,
      delegateContractAddress: DELEGATOR_CONTRACT as Address,
    });

    console.log(`\n✅ Workflow executed successfully!`);
    console.log(`   - Transaction Hash: ${txHash}`);
    console.log(`   - Explorer URL: https://sepolia.etherscan.io/tx/${txHash}`);
  } catch (err) {
    console.error("\n❌ Workflow execution failed.", err);
  }
}

runLimitOrderWorkflow();
