import React from "react";
import { Handle, Position } from "reactflow";
import { Cloud, GitBranch, Repeat, Zap } from "lucide-react";

const icons = {
  "pyth-network": <Cloud size={16} />,
  condition: <GitBranch size={16} />,
  swap: <Repeat size={16} />,
  default: <Zap size={16} />,
};

function CustomNode({ data, isConnectable, selected }) {
  const icon = icons[data.type] || icons.default;
  const borderClass = selected ? "border-blue-500" : "border-slate-300";

  // Get the inputs and outputs to calculate dynamic positioning
  const inputs = Object.entries(data.inputs || {});
  const outputs = Object.entries(data.outputs || {});

  // Define base positioning to avoid magic numbers
  const baseTopOffset = 70; // Initial vertical distance from the top of the node
  const handleSpacing = 25; // Vertical distance between multiple handles

  return (
    <div
      className={`bg-white rounded-md border-2 ${borderClass} shadow-md w-60`}
    >
      <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-slate-50 rounded-t-md">
        {icon}
        <div className="font-bold text-sm">{data.label}</div>
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
