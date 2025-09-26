// src/components/HypergraphSaver.jsx

import { useState } from "react";
import { useAccount, useWalletClient, useConnectorClient } from "wagmi";
// The new, correct imports based on the latest documentation
import { Graph, Ipfs } from "@graphprotocol/grc-20";
import { UploadCloud, Loader2 } from "lucide-react";

export default function HypergraphSaver({ workflowName, nodes, edges }) {
  const [isSaving, setIsSaving] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: connectorClient } = useConnectorClient();

  // Use fallback client if walletClient is not available
  const client = walletClient || connectorClient;

  // Debug logging to help identify the issue
  console.log("HypergraphSaver - Debug info:", {
    isConnected,
    hasWalletClient: !!walletClient,
    hasConnectorClient: !!connectorClient,
    hasClient: !!client,
    address,
    clientStatus: client ? "available" : "not available",
  });

  const handleSaveToHypergraph = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!client) {
      alert("Wallet client not ready. Please wait a moment and try again.");
      return;
    }

    if (!workflowName) {
      alert("Please provide a name for the workflow.");
      return;
    }
    setIsSaving(true);
    console.log("Starting Hypergraph save process...");

    try {
      // Step 1: Create a new "Space" for your workflow on the testnet.
      // A space is like a repository or a container.
      console.log("Step 1/5: Creating space...");
      const space = await Graph.createSpace({
        editorAddress: address,
        name: workflowName,
        network: "TESTNET",
      });
      const spaceId = space.id;
      console.log(`Space created with ID: ${spaceId}`);

      // Step 2: Create an "Entity" with the workflow data.
      // We'll store the entire nodes/edges structure as a JSON string in the description.
      console.log("Step 2/5: Creating entity...");
      const workflowData = { nodes, edges };
      const { ops } = await Graph.createEntity({
        name: workflowName,
        description: JSON.stringify(workflowData),
      });
      console.log("Entity operations created.");

      // Step 3: Publish the entity data to IPFS.
      console.log("Step 3/5: Publishing to IPFS...");
      const { cid } = await Ipfs.publishEdit({
        name: `Update for ${workflowName}`,
        ops,
        author: address,
      });
      console.log(`Published to IPFS with CID: ${cid}`);

      // Step 4: Fetch the transaction data (calldata) from the Hypergraph API.
      console.log("Step 4/5: Fetching transaction calldata...");
      const result = await fetch(
        `${Graph.TESTNET_API_ORIGIN}/space/${spaceId}/edit/calldata`,
        {
          method: "POST",
          body: JSON.stringify({ cid }),
        }
      );
      const { to, data } = await result.json();
      console.log("Transaction data received.");

      // Step 5: Send the transaction using the user's wallet.
      // This will trigger a signature request in MetaMask.
      console.log("Step 5/5: Sending transaction...");
      const txResult = await client.sendTransaction({
        // @ts-expect-error - viem account type mismatch is a known issue with the SDK
        account: client.account,
        to: to,
        data: data,
      });
      console.log("Transaction successful:", txResult);

      alert(`Workflow "${workflowName}" successfully saved to Hypergraph!`);
    } catch (error) {
      console.error("Failed to save to Hypergraph:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonText = () => {
    if (isSaving) return "Saving...";
    if (!isConnected) return "Connect Wallet First";
    if (!client) return "Wallet Loading...";
    return "Save to Hypergraph";
  };

  return (
    <button
      onClick={handleSaveToHypergraph}
      disabled={isSaving || !isConnected || !client}
      className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
    >
      {isSaving ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <UploadCloud size={16} />
      )}
      {getButtonText()}
    </button>
  );
}
