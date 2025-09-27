// example/uniswapSwapWorkflow.example.ts
//@ts-nocheck
import "dotenv/config";
import { uniswapV2Swap } from "../workflowbuilders/uniswapSwapWorkflow";
import { sepolia , base } from "viem/chains";

(async () => {
  const tx = await uniswapV2Swap({
    privateKey: process.env.USER_PRIVATE_KEY as string,
    chain: base,
    rpcUrl: process.env.SEPOLIA_RPC_URL as string,
    routerAddress: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3", // make sure this is a V2-style router
    tokenIn: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",  // USDC (example)
    tokenOut: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // some token
    amountIn: 10_000_000n, // 10 USDC (6 decimals)
    amountOutMin: 0n,      // set properly in prod
  });

  console.log("Swap tx hash:", tx);
})();
