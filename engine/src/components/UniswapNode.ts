import type { Node } from "../interfaces/Node.js";
import dotenv from "dotenv";
import { uniswapV2Swap } from "../workflow_executor/uniswapSwapWorkflow.js";
import { sepolia } from "viem/chains";

dotenv.config();

const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "";
const RPC_URL: string = process.env.RPC_URL || "";
const ROUTER_ADDRESS: string = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

export class UniswapNode implements Node {
    id: string;
    label: string;
    type: string = "swap";
    inputs: Record<string, any> = {};
    outputs: Record<string, any> = {};

    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    amountOutMin: bigint;

    constructor(id: string, label: string, tokenIn: string, tokenOut: string, amountIn: bigint, amountOutMin: bigint){
        this.id = id;
        this.label = label;
        this.tokenIn = tokenIn;
        this.tokenOut = tokenOut;
        this.amountIn = amountIn;
        this.amountOutMin = amountOutMin;
    }

    async execute(){
        const tx = await uniswapV2Swap({
            privateKey: PRIVATE_KEY as `0x${string}`,
            chain: sepolia,
            rpcUrl: RPC_URL,
            routerAddress: ROUTER_ADDRESS as `0x${string}`,
            tokenIn: this.tokenIn as `0x${string}`,
            tokenOut: this.tokenOut as `0x${string}`,
            amountIn: this.amountIn,
            amountOutMin: this.amountOutMin
        });

        console.log(`Swap TX ${tx}`);
    }
}