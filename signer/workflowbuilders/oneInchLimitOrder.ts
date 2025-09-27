
// // import { encodeFunctionData } from "viem";
// // import { erc20Abi } from "viem";
// // import axios from "axios";
// // import { Wallet } from "ethers";

// // export interface WorkflowAction {
// //   to: string;
// //   value: bigint;
// //   data: string;
// // }

// // export interface Workflow {
// //   actions: WorkflowAction[];
// // }

// // /**
// //  * Builds a workflow for a 1inch Limit Order using the Limit Order API (v4)
// //  */
// // export async function buildWorkflowForLimitOrderAPI(params: {
// //   makerPrivateKey: string; // private key for signing
// //   makerToken: string;
// //   takerToken: string;
// //   makingAmount: bigint;
// //   takingAmount: bigint;
// //   delegateAddress: string; // Delegator contract executing
// //   apiKey: string; // 1inch developer API key
// //   chainId?: number; // default 1 = Ethereum mainnet
// //   oneInchOrderBookContractAddress: string; // address of 1inch OrderBook contract
// // }): Promise<Workflow> {
// //   const {
// //     makerPrivateKey,
// //     makerToken,
// //     takerToken,
// //     makingAmount,
// //     takingAmount,
// //     delegateAddress,
// //     apiKey,
// //     chainId = 1,
// //   } = params;

// //   const maker = new Wallet(makerPrivateKey);

// //   // 1️⃣ Construct the order payload
// //   const orderPayload = {
// //     data: {
// //       makerAsset: makerToken,
// //       takerAsset: takerToken,
// //       maker: maker.address,
// //       receiver: "0x0000000000000000000000000000000000000000", // can be customized
// //       makingAmount: makingAmount.toString(),
// //       takingAmount: takingAmount.toString(),
// //       salt: Date.now().toString(), // simple salt
// //       extension: "0x",
// //       makerTraits: "0",
// //     },
// //     signature: "", // will be signed below
// //   };

// //   // 2️⃣ Sign the order payload using EIP-712
// //   // The structure of typedData must match 1inch API requirements
// //   // For simplicity, we sign the JSON string of data (can be adapted for full EIP-712)
// //   const signature = await maker.signMessage(JSON.stringify(orderPayload.data));
// //   orderPayload.signature = signature;

// //   // 3️⃣ Approve token first (optional)
// //   const approveAction: WorkflowAction = {
// //     to: makerToken,
// //     value: 0n,
// //     data: encodeFunctionData({
// //       abi: erc20Abi,
// //       functionName: "approve",
// //       args: [delegateAddress, makingAmount],
// //     }),
// //   };

// //   // 4️⃣ Create action to submit order to 1inch orderbook API
// //   const submitOrderAction: WorkflowAction = {
// //     to: oneInchOrderBookContractAddress, // placeholder for on-chain filling
// //     value: 0n,
// //     data: JSON.stringify(orderPayload), // just passing the payload; you can encode differently if needed
// //   };

// //   return {
// //     actions: [approveAction, submitOrderAction],
// //   };
// // }

// import { Wallet, JsonRpcProvider, Contract, MaxUint256 } from "ethers";
// import {
//   Sdk,
//   MakerTraits,
//   Address,
//   randBigInt,
//   FetchProviderConnector,
//   getLimitOrderV4Domain,
// } from "@1inch/limit-order-sdk";

// // ERC-20 minimal ABI
// const erc20AbiFragment = [
//   "function approve(address spender, uint256 amount) external returns (bool)",
//   "function allowance(address owner, address spender) external view returns (uint256)",
// ];

// /**

// Approve + Create + Submit Limit Order (1inch v4)
// */
// export async function buildWorkflowForLimitOrder(params: {
//   rpcUrl: string;
//   makerPrivateKey: string;
//   apiKey: string;
//   chainId?: number;
//   makerToken: string;
//   takerToken: string;
//   makingAmount: bigint;
//   takingAmount: bigint;
//   expiresInSeconds?: number;
// }) {
//   const {
//     rpcUrl,
//     makerPrivateKey,
//     apiKey,
//     makerToken,
//     takerToken,
//     makingAmount,
//     takingAmount,
//     chainId = 1,
//     expiresInSeconds = 300, // default 5 mins
//   } = params;

//   // 1️⃣ Wallet + Provider
//   const provider = new JsonRpcProvider(rpcUrl);
//   const wallet = new Wallet(makerPrivateKey, provider);

//   // 2️⃣ LimitOrder contract address
//   const domain = getLimitOrderV4Domain(chainId);
//   const limitOrderContractAddress = domain.verifyingContract;

//   // 3️⃣ Approve if needed
//   const makerAssetContract = new Contract(makerToken, erc20AbiFragment, wallet);
//   const currentAllowance = await makerAssetContract.allowance(
//     wallet.address,
//     limitOrderContractAddress,
//   );

//   if (currentAllowance < makingAmount) {
//     console.log("Approving token allowance...");
//     const tx = await makerAssetContract.approve(limitOrderContractAddress, MaxUint256);
//     await tx.wait();
//     console.log("✅ Approval successful");
//   }

//   // 4️⃣ SDK setup
//   const sdk = new Sdk({
//     authKey: apiKey,
//     networkId: chainId,
//     httpConnector: new FetchProviderConnector(),
//   });

//   // 5️⃣ MakerTraits (nonce + expiration)
//   const UINT_40_MAX = (1n << 48n) - 1n;
//   const expiration = BigInt(Math.floor(Date.now() / 1000)) + BigInt(expiresInSeconds);

//   const makerTraits = MakerTraits.default()
//     .withExpiration(expiration)
//     .withNonce(randBigInt(UINT_40_MAX));

//   // 6️⃣ Create order
//   const order = await sdk.createOrder(
//     {
//       makerAsset: new Address(makerToken),
//       takerAsset: new Address(takerToken),
//       makingAmount,
//       takingAmount,
//       maker: new Address(wallet.address),
//     },
//     makerTraits,
//   );

//   // 7️⃣ Sign EIP-712
//   const typedData = order.getTypedData(chainId);
//   const signature = await wallet.signTypedData(
//     typedData.domain,
//     { Order: typedData.types[typedData.primaryType] },
//     typedData.message,
//   );

//   // 8️⃣ Submit to 1inch Orderbook
//   try {
//     const result = await sdk.submitOrder(order, signature);
//     console.log("✅ Order submitted successfully:", result);
//     return result;
//   } catch (err) {
//     console.error("❌ Failed to submit order:", err);
//     throw err;
//   }
// }

//@ts-nocheck
import { Wallet, JsonRpcProvider, Contract, MaxUint256 } from "ethers"; 
import {
  Sdk,
  MakerTraits,
  Address,
  randBigInt,
  FetchProviderConnector,
  getLimitOrderV4Domain,
} from "@1inch/limit-order-sdk";

// ERC-20 minimal ABI
const erc20AbiFragment = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

/**
 * Approve + Create + Submit Limit Order (1inch v4)
 */
export async function buildWorkflowForLimitOrder(params: {
  rpcUrl: string;
  makerPrivateKey: string;
  apiKey: string;
  chainId?: number;
  makerToken: string;
  takerToken: string;
  makingAmount: bigint;
  takingAmount: bigint;
  expiresInSeconds?: number;
}) {
  const {
    rpcUrl,
    makerPrivateKey,
    apiKey,
    makerToken,
    takerToken,
    makingAmount,
    takingAmount,
    chainId,
    expiresInSeconds = 300, // default 5 mins
  } = params;

  // 1️⃣ Wallet + Provider
  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(makerPrivateKey, provider);

  // 2️⃣ LimitOrder contract address
  const domain = getLimitOrderV4Domain(chainId);
  const limitOrderContractAddress = domain.verifyingContract;

  // 3️⃣ Approve token if needed
  const makerAssetContract = new Contract(makerToken, erc20AbiFragment, wallet);
  const currentAllowance = await makerAssetContract.allowance(
    wallet.address,
    limitOrderContractAddress,
  );

  if (currentAllowance < makingAmount) {
    console.log("Approving token allowance...");
    const tx = await makerAssetContract.approve(limitOrderContractAddress, MaxUint256);
    await tx.wait();
    console.log("✅ Approval successful");
  }

  // 4️⃣ SDK setup
  const sdk = new Sdk({
    authKey: apiKey,
    networkId: chainId,
    httpConnector: new FetchProviderConnector(),
  });

  // 5️⃣ MakerTraits (40-bit nonce + expiration)
  const UINT_40_MAX = (1n << 40n) - 1n; // ✅ 40-bit max
  const expiration = BigInt(Math.floor(Date.now() / 1000)) + BigInt(expiresInSeconds);
  const nonce = randBigInt(UINT_40_MAX);

  const makerTraits = MakerTraits.default()
    .withExpiration(expiration)
    .withNonce(nonce)
    .allowPartialFills()   // ✅ this is required
    .allowMultipleFills(); // ✅ this is required

  // 6️⃣ Create order
  const order = await sdk.createOrder(
    {
      makerAsset: new Address(makerToken),
      takerAsset: new Address(takerToken),
      makingAmount,
      takingAmount,
      maker: new Address(wallet.address),
    },
    makerTraits,
  );

  // 7️⃣ Sign EIP-712
  const typedData = order.getTypedData(chainId);
  const signature = await wallet.signTypedData(
    typedData.domain,
    { Order: typedData.types[typedData.primaryType] },
    typedData.message,
  );

  // 8️⃣ Submit to 1inch Orderbook
  try {
    const result = await sdk.submitOrder(order, signature);
    console.log("✅ Order submitted successfully:", result);
    return result;
  } catch (err) {
    console.error("❌ Failed to submit order:", err);
    throw err;
  }
}
