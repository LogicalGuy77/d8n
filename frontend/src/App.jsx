// src/App.jsx

import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import Sidebar from "./components/Sidebar";
import WorkflowCanvas from "./components/WorkflowCanvas";
import SettingsPanel from "./components/SettingsPanel";
import ViewWorkflows from "./components/ViewWorkflows";
import HypergraphSaver from "./components/HypergraphSaver";
import HypergraphQuerier from "./components/HypergraphQuerier";

// Import wagmi hooks
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

// Import node configuration
import { NODE_CONFIG } from "./config/nodeConfig";

// Import custom hooks
import { useWorkflowExecution } from "./hooks/useWorkflowExecution";
import { useNodeStatus } from "./hooks/useNodeStatus";

let id = 1;
const getId = () => `${id++}`;

// --- Wallet Connection Component ---
function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <p className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-mono">
          {`${address.substring(0, 6)}...${address.substring(
            address.length - 4
          )}`}
        </p>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 text-white font-semibold text-sm py-2 px-3 rounded-md hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      className="bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600"
    >
      Connect Wallet
    </button>
  );
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState("My Arbitrage Workflow");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { address, isConnected } = useAccount();
  const { executeWorkflow } = useWorkflowExecution();
  const { currentExecutingNode, workflowCompleted } = useNodeStatus(address);

  // Trigger confetti when workflow completes
  useEffect(() => {
    if (workflowCompleted) {
      console.log("🎉 Workflow completed! Triggering confetti...");

      // Create a spectacular confetti effect
      const duration = 3000; // 3 seconds
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Multiple bursts from different positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [workflowCompleted]);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      let edgeParams = { ...params };

      if (sourceNode && sourceNode.data.type === "condition") {
        if (params.sourceHandle === "true-path") {
          edgeParams.label = "True";
        } else if (params.sourceHandle === "false-path") {
          edgeParams.label = "False";
        }
      }

      setEdges((eds) => addEdge(edgeParams, eds));
    },
    [nodes, setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(
    (type) => {
      const config = NODE_CONFIG[type];
      if (!config) return;
      const newNode = {
        id: getId(),
        type: "custom",
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { type: type, ...JSON.parse(JSON.stringify(config)) },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...newData } } : node
        )
      );
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) => ({ ...prev, data: { ...newData } }));
      }
    },
    [setNodes, selectedNode]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  const deleteEdge = useCallback(
    (edgeId) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  const handleExecuteWorkflow = useCallback(() => {
    if (!isConnected) {
      alert("Please connect your wallet to execute the workflow.");
      return;
    }
    executeWorkflow(nodes, edges, workflowName, address);
  }, [executeWorkflow, nodes, edges, workflowName, address, isConnected]);

  const handleSave = async () => {
    if (!isConnected) {
      alert("Please connect your wallet to save the workflow.");
      return;
    }
    const workflowData = {
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
    const finalSaveObject = {
      user_wallet: address,
      workflow_name: workflowName,
      workflow_data: workflowData,
    };
    console.log("Saving Workflow:", JSON.stringify(finalSaveObject, null, 2));
    try {
      const response = await fetch("http://localhost:3001/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSaveObject),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Something went wrong");
      alert(`Success: ${result.message}`);
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const loadWorkflow = useCallback(
    (flow) => {
      const { workflowName: name, workflowData } = flow;

      const nodesToLoad = Object.entries(workflowData.nodes).map(
        ([id, nodeData]) => ({
          id,
          position: nodeData.position,
          type: "custom",
          data: {
            label: nodeData.label,
            type: nodeData.type,
            node_data: nodeData.node_data,
            inputs: nodeData.inputs,
            outputs: nodeData.outputs,
          },
        })
      );

      const edgesToLoad = [];
      Object.entries(workflowData.edges).forEach(([source, targets]) => {
        Object.entries(targets).forEach(([target, handles]) => {
          Object.entries(handles).forEach(([sourceHandle, targetHandle]) => {
            edgesToLoad.push({
              id: `reactflow__edge-${source}${sourceHandle}-${target}${targetHandle}`,
              source,
              target,
              sourceHandle,
              targetHandle,
            });
          });
        });
      });

      setWorkflowName(name);
      setNodes(nodesToLoad);
      setEdges(edgesToLoad);

      // Fit view to show the loaded workflow
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView();
        }
      }, 100);
    },
    [setNodes, setEdges, reactFlowInstance]
  );

  const loadTemplate = useCallback(
    (template) => {
      // Convert template format to the format expected by the canvas
      const nodesToLoad = template.nodes.map((templateNode) => {
        const config = NODE_CONFIG[templateNode.type];
        return {
          id: templateNode.id,
          position: templateNode.position,
          type: "custom",
          data: {
            type: templateNode.type,
            label: templateNode.data.label,
            node_data: templateNode.data.node_data,
            inputs: config?.inputs || {},
            outputs: config?.outputs || {},
          },
        };
      });

      const edgesToLoad = template.edges.map((templateEdge) => ({
        id: templateEdge.id,
        source: templateEdge.source,
        target: templateEdge.target,
        sourceHandle: templateEdge.sourceHandle,
        targetHandle: templateEdge.targetHandle,
        label: templateEdge.label,
      }));

      setWorkflowName(template.name);
      setNodes(nodesToLoad);
      setEdges(edgesToLoad);

      // Fit view to show the loaded template
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView();
        }
      }, 100);
    },
    [setNodes, setEdges, reactFlowInstance]
  );

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen font-sans">
        <header className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-2xl font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1"
            placeholder="Workflow Name"
          />
          <div className="flex items-center gap-4">
            <ViewWorkflows onLoadWorkflow={loadWorkflow} />
            <HypergraphQuerier />
            <HypergraphSaver
              workflowName={workflowName}
              nodes={nodes}
              edges={edges}
            />
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
            >
              Save to DB
            </button>
            <WalletConnector />
          </div>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <Sidebar
            onAddNode={addNode}
            onExecuteWorkflow={handleExecuteWorkflow}
            onLoadTemplate={loadTemplate}
          />
          <main className="flex-grow relative">
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDeleteNode={deleteNode}
              onDeleteEdge={deleteEdge}
              onInit={setReactFlowInstance}
              currentExecutingNode={currentExecutingNode}
            />
          </main>
          {selectedNode && (
            <SettingsPanel
              node={selectedNode}
              onUpdateNode={updateNodeData}
              onDeselect={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
