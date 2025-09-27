import type { Node } from "../interfaces/Node.js";
import { PythIds } from "../constants/PythIds.js";
import { HermesClient } from "@pythnetwork/hermes-client";
import { ethers } from "ethers";
import PythAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json' with { type: 'json' };
import dotenv from "dotenv";

dotenv.config();

const CONTRACT_ADDRESS: string = process.env.PYTH_UPDATE_CONTRACT_ADDRESS || "";
const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "";
const RPC_URL: string = process.env.RPC_URL || "";

export class PythNode implements Node {
  id: string;
  label: string;
  type = "pyth-network";
  inputs: Record<string, any> = {};
  outputs: { price: number } = { price: NaN };
  priceId: string = "";
  connection = new HermesClient("https://hermes.pyth.network", {});
  private priceFeed: string;
  private isTransactionInProgress: boolean = false;

  constructor(id: string, label: string, priceFeed: string) {
    this.id = id;
    this.label = label;
    this.priceFeed = priceFeed;

    // Get the price ID from the PythIds mapping
    const priceId = PythIds[priceFeed];
    if (priceId) {
      this.priceId = priceId;
    } else {
      this.priceId = "";
      console.log(`Invalid price feed: ${priceFeed}`);
    }
  }

  async simulateTransaction(updateDataHex: string) {
      this.isTransactionInProgress = true;
      
      try {
          const updateData = [ethers.utils.arrayify(updateDataHex)];

          const provider = ethers.getDefaultProvider(RPC_URL);
          const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, PythAbi, wallet);
          const updateFee = await contract.getUpdateFee(updateData);

          console.log("Sending transaction...");

          const tx = await contract.updatePriceFeeds(updateData, {value: updateFee});
          const receipt = await tx.wait();

          console.log(JSON.stringify(receipt));
      } catch (error: any) {
          console.error("Transaction error:", error);
      } finally {
          this.isTransactionInProgress = false;
      }
  }

  async execute() {
    try {
      // Check if we have a valid price ID
      if (!this.priceId) {
        console.log(`No valid price ID for feed: ${this.priceFeed}`);
        this.outputs.price = NaN;
        return;
      }

      const priceUpdates = await this.connection.getLatestPriceUpdates([
        this.priceId,
      ]);
      console.log(JSON.stringify(priceUpdates));
      const parsed_prices = priceUpdates.parsed;
      // Extract price from the response and update outputs
      if (parsed_prices) {
        const priceFeedUpdate = parsed_prices[0];
        if (priceFeedUpdate) {
          const price =
            parseFloat(priceFeedUpdate.price.price) *
            Math.pow(10, priceFeedUpdate.price.expo);
          this.outputs.price = price;

          // Run transaction simulation in background only if not already in progress
          if (!this.isTransactionInProgress) {
            this.simulateTransaction("0x" + priceUpdates.binary.data[0]);
          }
        }
      } else {
        this.outputs.price = NaN;
      }
    } catch (e: unknown) {
      console.log("Error fetching price:", e);
      this.outputs.price = NaN;
    }
  }
}
