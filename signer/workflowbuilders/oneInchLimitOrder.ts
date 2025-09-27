//@ts-nocheck
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import axios from "axios";
import { Wallet } from "ethers";

export interface WorkflowAction {
  to: string;
  value: bigint;
  data: string;
}

export interface Workflow {
  actions: WorkflowAction[];
}

/**
 * Builds a workflow for a 1inch Limit Order using the Limit Order API (v4)
 */
export async function buildWorkflowForLimitOrderAPI(params: {
  makerPrivateKey: string; // private key for signing
  makerToken: string;
  takerToken: string;
  makingAmount: bigint;
  takingAmount: bigint;
  delegateAddress: string; // Delegator contract executing
  apiKey: string; // 1inch developer API key
  chainId?: number; // default 1 = Ethereum mainnet
  oneInchOrderBookContractAddress: string; // address of 1inch OrderBook contract
}): Promise<Workflow> {
  const {
    makerPrivateKey,
    makerToken,
    takerToken,
    makingAmount,
    takingAmount,
    delegateAddress,
    apiKey,
    chainId = 1,
  } = params;

  const maker = new Wallet(makerPrivateKey);

  // 1️⃣ Construct the order payload
  const orderPayload = {
    data: {
      makerAsset: makerToken,
      takerAsset: takerToken,
      maker: maker.address,
      receiver: "0x0000000000000000000000000000000000000000", // can be customized
      makingAmount: makingAmount.toString(),
      takingAmount: takingAmount.toString(),
      salt: Date.now().toString(), // simple salt
      extension: "0x",
      makerTraits: "0",
    },
    signature: "", // will be signed below
  };

  // 2️⃣ Sign the order payload using EIP-712
  // The structure of typedData must match 1inch API requirements
  // For simplicity, we sign the JSON string of data (can be adapted for full EIP-712)
  const signature = await maker.signMessage(JSON.stringify(orderPayload.data));
  orderPayload.signature = signature;

  // 3️⃣ Approve token first (optional)
  const approveAction: WorkflowAction = {
    to: makerToken,
    value: 0n,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [delegateAddress, makingAmount],
    }),
  };

  // 4️⃣ Create action to submit order to 1inch orderbook API
  const submitOrderAction: WorkflowAction = {
    to: oneInchOrderBookContractAddress, // placeholder for on-chain filling
    value: 0n,
    data: JSON.stringify(orderPayload), // just passing the payload; you can encode differently if needed
  };

  return {
    actions: [approveAction, submitOrderAction],
  };
}
