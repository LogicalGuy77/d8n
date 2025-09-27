import type { Node } from "../interfaces/Node.js";
import dotenv from "dotenv";
import { buildWorkflowForLimitOrder } from "../workflow_executor/oneInchLimitOrder.js";

dotenv.config();

const RPC_URL = process.env.BASE_RPC_URL || "";
const PRIVATE_KEY = process.env.BASE_PRIVATE_KEY || "";
const API_KEY = process.env.INCH_API_KEY || "";
const CHAIN_ID = 8453;

export class LimitOrderNode implements Node {
    id: string;
    label: string;
    type: string = "limitOrder";
    inputs: Record<string, any> = {};
    outputs: Record<string, any> = {};
    makerToken: string;
    takerToken: string;
    makingAmount: bigint;
    takingAmount: bigint;

    constructor(id: string, label: string, makerToken: string, takerToken: string, makingAmount: string, takingAmount: string){
        this.id = id;
        this.label = label;
        this.makerToken = makerToken;
        this.takerToken = takerToken;
        this.makingAmount = BigInt(makingAmount);
        this.takingAmount = BigInt(takingAmount);
    }

    async execute() {
        await buildWorkflowForLimitOrder({
            rpcUrl: RPC_URL,
            makerPrivateKey: PRIVATE_KEY,
            apiKey: API_KEY,
            chainId: CHAIN_ID,
            makerToken: this.makerToken,
            takerToken: this.takerToken,
            makingAmount: this.makingAmount,
            takingAmount: this.takingAmount
        });
    }
}