import { useCallback } from "react";

export const useWorkflowExecution = () => {
  const executeWorkflow = useCallback(
    async (
      nodes,
      edges,
      workflowName,
      walletAddress,
      workflowType = "once"
    ) => {
      const workflowData = {
        walletaddr: walletAddress,
        type: workflowType,
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

      console.log("Executing Workflow:", JSON.stringify(workflowData, null, 2));

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/workflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json_workflow: workflowData }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to execute workflow");
        }

        alert(`Workflow executed successfully: ${result.parsed}`);
        console.log("Execution result:", result);
      } catch (error) {
        console.error("Error executing workflow:", error);
        alert(`Error executing workflow: ${error.message}`);
      }
    },
    []
  );

  return { executeWorkflow };
};
