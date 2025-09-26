import React, { useMemo, useCallback } from "react";
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
    onDeleteNode,
    onDeleteEdge,
    onInit,
  } = props;
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Handle keyboard delete
  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      if (onDeleteNode) {
        nodesToDelete.forEach((node) => onDeleteNode(node.id));
      }
    },
    [onDeleteNode]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      if (onDeleteEdge) {
        edgesToDelete.forEach((edge) => onDeleteEdge(edge.id));
      }
    },
    [onDeleteEdge]
  );

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
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onInit={onInit}
        nodeTypes={nodeTypes}
        deleteKeyCode="Delete"
        fitView
        className="bg-slate-100"
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
