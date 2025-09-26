import React from "react";
import { Cloud, GitBranch, Repeat, Bug } from "lucide-react";

const nodeTypes = [
  { type: "pyth-network", label: "Pyth Price Feed", icon: <Cloud /> },
  { type: "condition", label: "Condition", icon: <GitBranch /> },
  { type: "swap", label: "1inch Swap", icon: <Repeat /> },
  { type: "print", label: "Print", icon: <Bug/>}
];

export default function Sidebar({ onAddNode }) {
  return (
    <aside className="w-64 bg-white p-4 border-r border-slate-200 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-slate-700">Nodes</h2>
      {nodeTypes.map((node) => (
        <button
          key={node.type}
          onClick={() => onAddNode(node.type)}
          className="flex items-center gap-3 p-3 text-left bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors duration-150"
        >
          <span className="text-blue-500">{node.icon}</span>
          <span className="font-semibold text-slate-800">{node.label}</span>
        </button>
      ))}
    </aside>
  );
}
