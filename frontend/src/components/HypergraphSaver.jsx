import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Graph, Ipfs } from "@graphprotocol/grc-20";
import { personalSpaceAdminAbi } from "../abis/personalSpaceAdminAbi";
import { UploadCloud, Loader2 } from "lucide-react";

export default function HypergraphSaver({ workflowName, nodes, edges }) {
  const [statusMessage, setStatusMessage] = useState("Save to Hypergraph");
  const { address, isConnected } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isSubmitting,
    isError: isSubmitError,
    error: submitError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const handleSaveToHypergraph = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!workflowName) {
      alert("Please provide a name for the workflow.");
      return;
    }

    try {
      // Prepare the workflow data in the specified format
      const workflowData = {
        walletaddr: address,
        type: "once",
        name: workflowName,
        nodes: {},
        edges: {},
      };

      nodes.forEach((node) => {
        workflowData.nodes[node.id] = {
          position: node.position,
          label: node.data.label,
          type: node.data.type,
          node_data: node.data.node_data,
          inputs: node.data.inputs,
          outputs: node.data.outputs,
        };
      });

      edges.forEach((edge) => {
        if (!workflowData.edges[edge.source])
          workflowData.edges[edge.source] = {};
        if (!workflowData.edges[edge.source][edge.target])
          workflowData.edges[edge.source][edge.target] = {};
        workflowData.edges[edge.source][edge.target][edge.sourceHandle] =
          edge.targetHandle;
      });

      setStatusMessage("1/5: Creating space...");
      const space = await Graph.createSpace({
        editorAddress: address,
        name: workflowName,
        network: "TESTNET",
      });
      const spaceId = space.id;
      console.log(`Space created with ID: ${spaceId}`);

      setStatusMessage("2/5: Creating entity...");
      const { ops } = await Graph.createEntity({
        name: workflowName,
        description: JSON.stringify(workflowData), // Save the formatted workflow data
      });

      setStatusMessage("3/5: Publishing to IPFS...");
      const { cid } = await Ipfs.publishEdit({
        name: `Update for ${workflowName}`,
        ops,
        author: address,
      });
      console.log(`Published to IPFS with CID: ${cid}`);

      setStatusMessage("4/5: Fetching transaction data...");
      const result = await fetch(
        `${Graph.TESTNET_API_ORIGIN}/space/${spaceId}/edit/calldata`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cid: cid.toString() }),
        }
      );

      if (!result.ok) {
        const errorBody = await result.text();
        throw new Error(
          `HTTP error! status: ${result.status}, body: ${errorBody}`
        );
      }

      const { to, data, value = "0" } = await result.json();

      setStatusMessage("5/5: Awaiting wallet confirmation...");
      writeContract({
        address: to,
        abi: personalSpaceAdminAbi,
        functionName: "submitEdits",
        args: [cid.toString(), "0x", address],
        data,
        value: BigInt(value),
      });
    } catch (error) {
      console.error("Failed during preparation:", error);
      alert(`An unexpected error occurred: ${error.message}`);
      setStatusMessage("Save to Hypergraph");
    }
  };

  useEffect(() => {
    if (isSubmitting) {
      setStatusMessage("Confirm in wallet...");
    } else if (isConfirming) {
      setStatusMessage("Confirming transaction...");
    } else if (isSuccess) {
      alert(`Workflow "${workflowName}" successfully saved to Hypergraph!`);
      setStatusMessage("Save to Hypergraph");
    } else if (isSubmitError || isConfirmError) {
      const error = submitError || confirmError;
      console.error("Transaction Error:", error);
      alert(`Transaction Failed: ${error.shortMessage || error.message}`);
      setStatusMessage("Save to Hypergraph");
    }
  }, [
    isSubmitting,
    isConfirming,
    isSuccess,
    isSubmitError,
    isConfirmError,
    submitError,
    confirmError,
    workflowName,
  ]);

  const isLoading = statusMessage !== "Save to Hypergraph";

  return (
    <button
      onClick={handleSaveToHypergraph}
      disabled={!isConnected || isLoading}
      className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <UploadCloud size={16} />
      )}
      {isLoading ? statusMessage : "Save to Hypergraph"}
    </button>
  );
}
