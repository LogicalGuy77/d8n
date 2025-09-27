// poolManagerSwapWorkflow.ts
//@ts-nocheck
import { encodeFunctionData, Address } from "viem";
import { Workflow } from "../src/signer"; // Delegator SDK types
import { erc20Abi } from "viem";
import { poolManagerAbi } from "../abis/poolManagerAbi"; // create this ABI file

interface BuildPoolManagerSwapWorkflowArgs {
    makerPrivateKey: string;
    makerToken: Address;
    takerToken: Address;
    amountIn: bigint;
    amountOutMin: bigint;
    delegateAddress: Address;
    chainId: number;
    poolManagerAddress: Address;
}

/**
 * Builds a workflow for swapping tokens via PoolManager on Uniswap V4
 */
export async function buildWorkflowForPoolManagerSwap({
    makerPrivateKey,
    makerToken,
    takerToken,
    amountIn,
    amountOutMin,
    delegateAddress,
    chainId,
    poolManagerAddress,
}: BuildPoolManagerSwapWorkflowArgs): Promise<Workflow> {
    // 1️⃣ Approve PoolManager to spend makerToken
    const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [poolManagerAddress, amountIn],
    });

    // 2️⃣ Prepare PoolManager swap call
    // Assuming PoolManager has a `swapExactInput` function
    const deadline = BigInt(Math.floor(Date.now() / 1000)) + 60n * 20n;

    const swapData = encodeFunctionData({
        abi: poolManagerAbi,
        functionName: "swapExactInput", // Replace with actual PoolManager swap function
        args: [
            makerToken,
            takerToken,
            amountIn,
            amountOutMin,
            delegateAddress,
            deadline,
        ],
    });

    // 3️⃣ Workflow actions
    const workflow: Workflow = {
        nonce: `poolmanager-${Date.now()}`, // unique identifier
        chainId,
        actions: [
            {
                to: makerToken,
                value: 0n,
                data: approveData,
            },
            {
                to: poolManagerAddress,
                value: 0n,
                data: swapData,
            },
        ],
    };

    return workflow;
}
