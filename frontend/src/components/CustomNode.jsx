import React from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Cloud, GitBranch, Repeat, Zap, X } from "lucide-react";

const icons = {
  "pyth-network": <Cloud size={16} />,
  condition: <GitBranch size={16} />,
  swap: <Repeat size={16} />,
  default: <Zap size={16} />,
};

function CustomNode({ data, isConnectable, selected, id }) {
  const { setNodes, setEdges } = useReactFlow();
  const icon = icons[data.type] || icons.default;

  // Define border and background classes based on state
  let borderClass = "border-slate-300";
  let bgClass = "bg-white";
  let headerClass = "bg-slate-50";

  if (data.isExecuting) {
    borderClass = "border-green-500 border-4 animate-pulse";
    bgClass = "bg-green-50";
    headerClass = "bg-green-100";
  } else if (selected) {
    borderClass = "border-blue-500";
  }

  // Get the inputs and outputs to calculate dynamic positioning
  const inputs = Object.entries(data.inputs || {});
  const outputs = Object.entries(data.outputs || {});

  // Define base positioning to avoid magic numbers
  const baseTopOffset = 70; // Initial vertical distance from the top of the node
  const handleSpacing = 25; // Vertical distance between multiple handles

  const onDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  return (
    <div
      className={`${bgClass} rounded-md border-2 ${borderClass} shadow-md w-60`}
    >
      <div
        className={`flex items-center justify-between p-2 border-b border-slate-200 ${headerClass} rounded-t-md`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="font-bold text-sm">{data.label}</div>
          {data.isExecuting && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-xs text-green-600 font-semibold">
                Running
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
          title="Delete node"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 text-xs text-slate-500">
        <p>Type: {data.type}</p>
      </div>

      {/* Map over inputs and position them on the LEFT */}
      {inputs.map(([key], index) => (
        <Handle
          key={key}
          type="target"
          position={Position.Left}
          id={key}
          style={{ top: `${baseTopOffset + index * handleSpacing}px` }}
          isConnectable={isConnectable}
        />
      ))}

      {/* Map over outputs and position them on the RIGHT */}
      {outputs.map(([key], index) => (
        <Handle
          key={key}
          type="source"
          position={Position.Right}
          id={key}
          style={{ top: `${baseTopOffset + index * handleSpacing}px` }}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
}

export default React.memo(CustomNode);
