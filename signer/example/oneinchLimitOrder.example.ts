import { buildWorkflowForLimitOrder } from "../workflowbuilders/oneInchLimitOrder";
import "dotenv/config";

(async () => {
  await buildWorkflowForLimitOrder({
    rpcUrl: "https://base-mainnet.g.alchemy.com/v2/Hq3TrI_p9vm6iYnmwiczU", // replace with your provider
    makerPrivateKey: process.env.LIMIT_ORDER_PRIVATE_KEY!,
    apiKey: process.env.INCH_API_KEY!,
    chainId: 8453, // Base mainnet
    makerToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    takerToken: "0xc5fecC3a29Fb57B5024eEc8a2239d4621e111CBE", // 1INCH on Base
    makingAmount: 1_000_000n, // 1 USDC (6 decimals)
    takingAmount: 1_000_000_000_000_000_000n, // 1 1INCH (18 decimals)
  });
})();
