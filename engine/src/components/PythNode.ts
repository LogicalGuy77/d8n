import type { Node } from "../interfaces/Node.js";
import { PythIds } from "../constants/PythIds.js";
import { HermesClient } from "@pythnetwork/hermes-client";

export class PythNode implements Node {
    id: string;
    label: string;
    type = "pyth";
    inputs: Record<string, any> = {};
    outputs: { price: number} = {price: NaN};
    nodeData: { priceId: string[] | undefined};
    connection = new HermesClient("https://hermes.pyth.network", {});
    private priceFeed: string;

    constructor(id: string, label: string, priceFeed: string){
        this.id = id;
        this.label = label;
        this.priceFeed = priceFeed;
        
        // Get the price ID from the PythIds mapping
        const priceId = PythIds[priceFeed];
        if (priceId) {
            this.nodeData = {priceId: [priceId]};
        } else {
            this.nodeData = {priceId: undefined};
            console.log(`Invalid price feed: ${priceFeed}`);
        }
    }

    async execute() {
        try {
            // Check if we have a valid price ID
            if (!this.nodeData.priceId) {
                console.log(`No valid price ID for feed: ${this.priceFeed}`);
                this.outputs.price = NaN;
                return;
            }
            
            const priceUpdates = await this.connection.getLatestPriceUpdates(this.nodeData.priceId);
            const parsed_prices = priceUpdates.parsed;
            // Extract price from the response and update outputs
            if (parsed_prices) {
                const priceFeedUpdate = parsed_prices[0];
                if(priceFeedUpdate){
                    const price = parseFloat(priceFeedUpdate.price.price) * Math.pow(10, priceFeedUpdate.price.expo);
                    this.outputs.price = price;
                }
            } else {
                this.outputs.price = NaN;
            }
        }
        catch (e: unknown){
            console.log("Error fetching price:", e);
            this.outputs.price = NaN;
        }
    }
}