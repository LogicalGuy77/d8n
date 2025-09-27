import React from "react";
import { X } from "lucide-react";
import { PYTH_SYMBOLS } from "../constants/pythSymbols";

export default function SettingsPanel({ node, onUpdateNode, onDeselect }) {
  if (!node) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...node.data,
      node_data: {
        ...node.data.node_data,
        [name]: value,
      },
    };
    onUpdateNode(node.id, updatedData);
  };

  const handleLabelChange = (e) => {
    onUpdateNode(node.id, { ...node.data, label: e.target.value });
  };

  const renderSettings = () => {
    switch (node.data.type) {
      case "pyth-network":
        return (
          <div className="flex flex-col gap-2">
            <label htmlFor="symbol" className="font-semibold">
              Symbol
            </label>
            <select
              id="symbol"
              name="symbol"
              value={node.data.node_data?.symbol || "BTC_USD"}
              onChange={handleInputChange}
              className="p-2 border rounded"
            >
              {PYTH_SYMBOLS.map((symbol) => (
                <option key={symbol.value} value={symbol.value}>
                  {symbol.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "condition":
        return (
          <div className="flex flex-col gap-2">
            <label htmlFor="condition" className="font-semibold">
              Condition
            </label>
            <input
              id="condition"
              name="condition"
              defaultValue={node.data.node_data?.condition}
              onChange={handleInputChange}
              className="p-2 border rounded"
              placeholder="e.g., price > 100000"
            />
          </div>
        );
      case "swap":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="symbol" className="font-semibold">
                Symbol
              </label>
              <input
                id="symbol"
                name="symbol"
                defaultValue={node.data.node_data?.symbol}
                onChange={handleInputChange}
                className="p-2 border rounded w-full mt-1"
                placeholder="e.g., btc"
              />
            </div>
            <div>
              <label htmlFor="sender" className="font-semibold">
                Sender
              </label>
              <input
                id="sender"
                name="sender"
                defaultValue={node.data.node_data?.sender}
                onChange={handleInputChange}
                className="p-2 border rounded w-full mt-1"
                placeholder="Your wallet address"
              />
            </div>
          </div>
        );
      default:
        return <p>No settings available for this node.</p>;
    }
  };

  return (
    <aside className="w-80 bg-white p-4 border-l border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Settings</h3>
        <button
          onClick={onDeselect}
          className="p-1 hover:bg-slate-200 rounded-full"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="label" className="font-semibold">
            Label
          </label>
          <input
            id="label"
            name="label"
            value={node.data.label}
            onChange={handleLabelChange}
            className="p-2 border rounded w-full mt-1"
          />
        </div>
        <hr />
        {renderSettings()}
      </div>
    </aside>
  );
}
