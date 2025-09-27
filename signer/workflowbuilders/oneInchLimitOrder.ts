//@ts-nocheck
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import { Wallet } from "ethers";
import { Sdk, MakerTraits, Address, randBigInt, FetchProviderConnector } from "@1inch/limit-order-sdk";

export interface WorkflowAction {
  to: string;
  value: bigint;
  data: string;
}

export interface Workflow {
  actions: WorkflowAction[];
}

/**
 * Builds a workflow for a 1inch Limit Order.
 */
export async function buildWorkflowForLimitOrder(params: {
  chainId: number; // 11155111 for Sepolia
  makerPrivateKey: string; // private key for the maker (must have funds)
  makerToken: string; // token you are selling
  takerToken: string; // token you want to buy
  makingAmount: bigint; // amount of makerToken
  takingAmount: bigint; // amount of takerToken
  delegateAddress: string; // the Delegator contract address executing
  apiKey: string; // 1inch Developer API key
  expirationSeconds?: number; // optional expiration time
}): Promise<Workflow> {
  const {
    chainId,
    makerPrivateKey,
    makerToken,
    takerToken,
    makingAmount,
    takingAmount,
    delegateAddress,
    apiKey,
    expirationSeconds = 120,
  } = params;

  const maker = new Wallet(makerPrivateKey);

  // 1️⃣ Initialize the 1inch SDK
  const sdk = new Sdk({
    authKey: apiKey,
    networkId: chainId,
    httpConnector: new FetchProviderConnector(),
  });

  // 2️⃣ Setup expiration & nonce
  const expiration = BigInt(Math.floor(Date.now() / 1000)) + BigInt(expirationSeconds);
  const UINT_40_MAX = (1n << 48n) - 1n;
  const makerTraits = MakerTraits.default()
    .withExpiration(expiration)
    .withNonce(randBigInt(UINT_40_MAX));

  // 3️⃣ Create the limit order
  const order = await sdk.createOrder(
    {
      makerAsset: new Address(makerToken),
      takerAsset: new Address(takerToken),
      makingAmount,
      takingAmount,
      maker: new Address(maker.address),
    },
    makerTraits
  );

  // 4️⃣ Sign the order
  const typedData = order.getTypedData();
  const signature = await maker.signTypedData(
    typedData.domain,
    { Order: typedData.types.Order },
    typedData.message
  );

  // 5️⃣ Generate calldata for filling the order
  const fillTx = sdk.fillOrder(order, signature).tx;

  // Optional: Approve action first
  const approveAction: WorkflowAction = {
    to: makerToken,
    value: 0n,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [fillTx.to, makingAmount],
    }),
  };

  const limitOrderAction: WorkflowAction = {
    to: fillTx.to,
    value: BigInt(fillTx.value),
    data: fillTx.data,
  };

  return {
    actions: [approveAction, limitOrderAction],
  };
}
