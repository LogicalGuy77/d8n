// example/uniswapSwapWorkflow.example.ts
import "dotenv/config";
import { uniswapV2Swap } from "../workflowbuilders/uniswapSwapWorkflow";
import { sepolia } from "viem/chains";

(async () => {
  const tx = await uniswapV2Swap({
    privateKey: process.env.USER_PRIVATE_KEY as string,
    chain: sepolia,
    rpcUrl: process.env.SEPOLIA_RPC_URL as string,
    routerAddress: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3", // make sure this is a V2-style router
    tokenIn: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",  // USDC (example)
    tokenOut: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // some token
    amountIn: 10_000_000n, // 10 USDC (6 decimals)
    amountOutMin: 0n,      // set properly in prod
  });

  console.log("Swap tx hash:", tx);
})();
