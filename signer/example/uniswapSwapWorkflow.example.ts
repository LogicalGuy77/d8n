// runPoolManagerSwap.ts
//@ts-nocheck
import { buildWorkflowForPoolManagerSwap } from "../workflowbuilders/uniswapSwapWorkflow";
import { executeWorkflow } from "../src/signer";
import dotenv from "dotenv";
import { sepolia } from "viem/chains";
import { Address } from "viem";

dotenv.config();

async function runPoolManagerSwapWorkflow() {
  const DELEGATOR_CONTRACT = process.env.DELEGATOR_CONTRACT!;
  const MAKER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY!;
  const RPC_URL = process.env.SEPOLIA_RPC_URL!;
  const POOL_MANAGER_ADDRESS = process.env.POOL_MANAGER_ADDRESS!; // must set per chain

  const workflow = await buildWorkflowForPoolManagerSwap({
    makerPrivateKey: MAKER_PRIVATE_KEY,
    makerToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
    takerToken: "0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD" as Address,
    amountIn: 1_000_000n,   // 1 USDC
    amountOutMin: 999_000n, // expected min USDT
    delegateAddress: DELEGATOR_CONTRACT as Address,
    chainId: sepolia.id, // dynamically replace per network
    poolManagerAddress: POOL_MANAGER_ADDRESS as Address,
  });

  console.log("✅ PoolManager Swap Workflow built:", workflow);

  try {
    const txHash = await executeWorkflow({
      privateKey: MAKER_PRIVATE_KEY,
      workflow,
      chain: sepolia, // swap dynamically based on chainId
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

runPoolManagerSwapWorkflow();
