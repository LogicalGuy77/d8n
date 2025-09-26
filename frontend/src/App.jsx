// src/App.jsx

import { useState, useCallback, useRef } from "react";
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

// Import wagmi hooks
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

const NODE_CONFIG = {
  "pyth-network": {
    label: "Pyth Price Feed",
    inputs: {},
    outputs: { price: { type: "float" } },
    "node-data": { symbol: "btc/usd" },
  },
  condition: {
    label: "Condition",
    inputs: { price: { type: "float" } },
    outputs: { "true-path": { type: "bool" }, "false-path": { type: "bool" } },
    "node-data": { condition: "price > 100000" },
  },
  swap: {
    label: "1inch Swap",
    inputs: { activate: { type: "bool" } },
    outputs: {},
    "node-data": { symbol: "btc", sender: "", receiver: "" },
  },
};

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
  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
        "node-data": node.data["node-data"],
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
            "node-data": nodeData["node-data"],
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
            <ViewWorkflows onLoadWorkflow={loadWorkflow} />{" "}
            {/* <-- ADD COMPONENT */}
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
          <Sidebar onAddNode={addNode} />
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
