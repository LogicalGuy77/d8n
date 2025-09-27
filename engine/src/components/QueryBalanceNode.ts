import type { Node } from "../interfaces/Node.js";
import { queryNativeTokenBalance, queryERC20TokenBalance } from "../workflow_executor/balanceQuery.js";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL || "";

export class QueryBalanceNode implements Node {
    id: string;
    label: string;
    type: string = "queryBalance";
    inputs: Record<string, any> = {};
    outputs: { balance: string, raw: string, decimals?: number } = { balance: "0", raw: "0" };
    
    tokenAddress: string;
    walletAddress: string;
    isNative: boolean = true;

    constructor(id: string, label: string, tokenAddress: string, walletAddress: string) {
        this.id = id;
        this.label = label;
        this.tokenAddress = tokenAddress;
        this.walletAddress = walletAddress;
        
        // If tokenAddress is empty string, treat as native token
        this.isNative = !tokenAddress || tokenAddress.trim() === "";
    }

    async execute() {
        try {
            if (this.isNative) {
                const result = await queryNativeTokenBalance({
                    chain: sepolia,
                    rpcUrl: RPC_URL,
                    walletAddress: this.walletAddress,
                });

                this.outputs.balance = result.formatted;
                this.outputs.raw = result.raw;
                
                console.log(`Native balance for ${this.walletAddress}: ${result.formatted} ETH`);
            } else {
                const result = await queryERC20TokenBalance({
                    chain: sepolia,
                    rpcUrl: RPC_URL,
                    tokenAddress: this.tokenAddress,
                    walletAddress: this.walletAddress,
                });

                this.outputs.balance = result.formatted;
                this.outputs.raw = result.raw;
                this.outputs.decimals = result.decimals;
                
                console.log(`ERC20 balance for ${this.walletAddress} (${this.tokenAddress}): ${result.formatted} tokens`);
            }
        } catch (error) {
            console.error("Error querying balance:", error);
            this.outputs.balance = "0";
            this.outputs.raw = "0";
        }
    }
}