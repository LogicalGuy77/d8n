import React, { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import CustomNode from "./CustomNode";

export default function WorkflowCanvas(props) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
  } = props;
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="flex-grow h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-100"
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
