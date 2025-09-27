//@ts-nocheck
import axios from "axios";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";

export interface WorkflowAction {
  to: string;
  value: bigint;
  data: string;
}

export interface Workflow {
  actions: WorkflowAction[];
}

interface ApproveTxResponse {
  from: string;
  to: string;
  data: string;
  value: string;
  gas: string;
}

export async function get1InchApproveTx(
  tokenAddress: string,
  walletAddress: string,
  chainId: number,
  apiKey: string
): Promise<ApproveTxResponse> {
  const url = `https://api.1inch.dev/swap/v6.1/${chainId}/approve/transaction`;

  try {
    const response = await axios.get(url, {
      params: {
        tokenAddress,
        walletAddress
      },
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    return response.data as ApproveTxResponse;
  } catch (error: any) {
    console.error("Error fetching approve tx:", error.response?.data || error.message);
    throw error;
  }
}

export async function buildWorkflowForSwap(params: {
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: bigint;
  delegateAddress: string; // who will execute (the Delegate contract)
  routerAddress: string; // 1inch router
  apiKey: string;
  slippage?: number;
}): Promise<Workflow> {
  const {
    chainId,
    fromToken,
    toToken,
    amount,
    delegateAddress,
    routerAddress,
    apiKey,
    slippage = 1
  } = params;

  // 1. Approve Action
  const approveAction: WorkflowAction = {
    to: fromToken,
    value: 0n,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [routerAddress, amount]
    })
  };

  // 2. Swap Action (via 1inch API)
  const swapUrl = `https://api.1inch.dev/swap/v6.1/${chainId}/swap`;
  const swapResponse = await axios.get(swapUrl, {
    params: {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount: amount.toString(),
      fromAddress: delegateAddress,
      slippage
    },
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const swapTx = swapResponse.data.tx;
  const swapAction: WorkflowAction = {
    to: swapTx.to,
    value: BigInt(swapTx.value),
    data: swapTx.data
  };

  // Return workflow
  return {
    actions: [approveAction, swapAction]
  };
}


/*
async function run() {
  const workflow = await buildWorkflowForSwap({
    chainId: 11155111, // Sepolia
    fromToken: "0xUSDT...",
    toToken: "0xWETH...",
    amount: 1_000_000n, // 1 USDT
    delegateAddress: "0xYourDelegateContract",
    routerAddress: "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch router v6
    apiKey: process.env.ONEINCH_API_KEY!
  });

  console.log("Workflow ready:", workflow);

  // Now pass `workflow` into executeWorkflow(...)
}
*/