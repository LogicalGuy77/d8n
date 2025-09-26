//src/components/HypergraphSaver.jsx

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Graph, Ipfs } from "@graphprotocol/grc-20";
import { UploadCloud, Loader2 } from "lucide-react";

export default function HypergraphSaver({ workflowName, nodes, edges }) {
  const [isSaving, setIsSaving] = useState(false);
  const [preparingTx, setPreparingTx] = useState(false);
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSaveToHypergraph = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!workflowName) {
      alert("Please provide a name for the workflow.");
      return;
    }

    setIsSaving(true);
    setPreparingTx(true);
    console.log("Starting Hypergraph save process...");

    try {
      // Step 1: Create a new "Space" for your workflow on the testnet.
      console.log("Step 1/5: Creating space...");
      const space = await Graph.createSpace({
        editorAddress: address,
        name: workflowName,
        network: "TESTNET",
      });
      const spaceId = space.id;
      console.log(`Space created with ID: ${spaceId}`);

      // Step 2: Create an "Entity" with the workflow data.
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cid }),
        }
      );

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const { to, data } = await result.json();
      console.log("Transaction data received.");

      setPreparingTx(false);

      // Step 5: Send the transaction using writeContract
      console.log("Step 5/5: Sending transaction...");
      writeContract({
        address: to,
        data: data,
        value: 0n,
      });
    } catch (error) {
      console.error("Failed to save to Hypergraph:", error);
      alert(`Error: ${error.message}`);
      setIsSaving(false);
      setPreparingTx(false);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      alert(`Workflow "${workflowName}" successfully saved to Hypergraph!`);
      setIsSaving(false);
      setPreparingTx(false);
    }
  }, [isSuccess, workflowName]);

  const getButtonText = () => {
    if (preparingTx) return "Preparing Transaction...";
    if (isPending) return "Confirm in Wallet...";
    if (isConfirming) return "Confirming Transaction...";
    if (!isConnected) return "Connect Wallet First";
    return "Save to Hypergraph";
  };

  const isButtonDisabled = () => {
    return isSaving || !isConnected || preparingTx || isPending || isConfirming;
  };

  return (
    <button
      onClick={handleSaveToHypergraph}
      disabled={isButtonDisabled()}
      className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
    >
      {isSaving || preparingTx || isPending || isConfirming ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <UploadCloud size={16} />
      )}
      {getButtonText()}
    </button>
  );
}
