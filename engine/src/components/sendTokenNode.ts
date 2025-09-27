import type { Node } from "../interfaces/Node.js";
import {
  sendERC20Token,
  sendNativeToken,
} from "../workflow_executor/assetSender.js";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

export class sendTokenNode implements Node {
  id: string;
  label: string;
  type: string = "sendToken";
  inputs: Record<string, any> = {};
  outputs: { txHash: string } = { txHash: "" };
  is_native: boolean = true;
  tokenAddress: string = "";
  destination: string;
  amount: string;

  constructor(
    id: string,
    label: string,
    tokenAddress: string,
    destination: string,
    amount: string
  ) {
    this.id = id;
    this.label = label;
    if (tokenAddress) {
      this.tokenAddress = tokenAddress;
      this.is_native = false;
    }

    this.destination = destination;
    this.amount = amount;
  }

  async execute() {
    if (this.is_native) {
      const tx = await sendNativeToken({
        chain: sepolia,
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY as `0x${string}`,
        to: this.destination,
        amount: this.amount,
      });

      this.outputs.txHash = tx.txHash;
      console.log(JSON.stringify(tx));
    } else {
      const tx = await sendERC20Token({
        chain: sepolia,
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY as `0x${string}`,
        tokenAddress: this.tokenAddress,
        to: this.destination,
        amount: BigInt(this.amount),
      });

      this.outputs.txHash = tx.txHash;
      console.log(JSON.stringify(tx));
    }
  }
}
