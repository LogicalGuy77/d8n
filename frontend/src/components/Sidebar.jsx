import React, { useState } from "react";
import {
  Cloud,
  GitBranch,
  Repeat,
  Bug,
  Play,
  FileText,
  Send,
} from "lucide-react";
import TemplateModal from "./TemplateModal";

const nodeTypes = [
  { type: "pyth-network", label: "Pyth Price Feed", icon: <Cloud /> },
  { type: "sendToken", label: "Send Token to any address", icon: <Send /> },
  { type: "condition", label: "Condition", icon: <GitBranch /> },
  { type: "swap", label: "1inch Swap", icon: <Repeat /> },
  { type: "print", label: "Print", icon: <Bug /> },
];

export default function Sidebar({
  onAddNode,
  onExecuteWorkflow,
  onLoadTemplate,
}) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleLoadTemplate = (template) => {
    onLoadTemplate(template);
    setIsTemplateModalOpen(false);
  };

  return (
    <>
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

        <div className="border-t border-slate-200 pt-4 mt-4">
          <h2 className="text-xl font-bold text-slate-700 mb-4">Templates</h2>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-400 transition-colors duration-150"
          >
            <span className="text-purple-500">
              <FileText />
            </span>
            <span className="font-semibold text-slate-800">
              Workflow Templates
            </span>
          </button>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-4">
          <h2 className="text-xl font-bold text-slate-700 mb-4">Actions</h2>
          <button
            onClick={onExecuteWorkflow}
            className="flex items-center gap-3 p-3 w-full text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-400 transition-colors duration-150"
          >
            <span className="text-green-500">
              <Play />
            </span>
            <span className="font-semibold text-slate-800">
              Execute Workflow
            </span>
          </button>
        </div>
      </aside>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />
    </>
  );
}
