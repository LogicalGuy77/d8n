import React from "react";
import { X } from "lucide-react";
import { PYTH_SYMBOLS } from "../constants/pythSymbols";
import { tokens } from "../constants/tokenMappings";

export default function SettingsPanel({ node, onUpdateNode, onDeselect }) {
  if (!node) return null;

  // Helper function to convert amount with decimals
  const convertAmountWithDecimals = (amount, tokenAddress) => {
    if (!amount || amount === "") return "0";
    const token = Object.values(tokens).find((t) => t.address === tokenAddress);
    const decimals = token ? token.decimal : 18; // default to 18 if token not found
    const multiplier = Math.pow(10, decimals);
    return (parseFloat(amount) * multiplier).toString();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle amount conversion for swap nodes
    if (node.data.type === "swap" && name === "amountIn") {
      const tokenInAddress = node.data.node_data?.tokenIn;
      processedValue = convertAmountWithDecimals(value, tokenInAddress);
    }

    const updatedData = {
      ...node.data,
      node_data: {
        ...node.data.node_data,
        [name]: processedValue,
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
              <label htmlFor="tokenIn" className="font-semibold">
                Token In
              </label>
              <select
                id="tokenIn"
                name="tokenIn"
                value={node.data.node_data?.tokenIn || tokens.USDC.address}
                onChange={handleInputChange}
                className="p-2 border rounded w-full mt-1"
              >
                {Object.entries(tokens).map(([symbol, token]) => (
                  <option key={token.address} value={token.address}>
                    {symbol} ({token.address.slice(0, 6)}...
                    {token.address.slice(-4)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tokenOut" className="font-semibold">
                Token Out
              </label>
              <select
                id="tokenOut"
                name="tokenOut"
                value={node.data.node_data?.tokenOut || tokens.USDT.address}
                onChange={handleInputChange}
                className="p-2 border rounded w-full mt-1"
              >
                {Object.entries(tokens).map(([symbol, token]) => (
                  <option key={token.address} value={token.address}>
                    {symbol} ({token.address.slice(0, 6)}...
                    {token.address.slice(-4)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amountIn" className="font-semibold">
                Amount In (will be converted with decimals)
              </label>
              <input
                id="amountIn"
                name="amountIn"
                type="number"
                step="any"
                defaultValue={(() => {
                  const currentAmount = node.data.node_data?.amountIn || "0";
                  const tokenInAddress = node.data.node_data?.tokenIn;
                  const token = Object.values(tokens).find(
                    (t) => t.address === tokenInAddress
                  );
                  const decimals = token ? token.decimal : 18;
                  return parseFloat(currentAmount) / Math.pow(10, decimals);
                })()}
                onChange={handleInputChange}
                className="p-2 border rounded w-full mt-1"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label htmlFor="amountOutMin" className="font-semibold">
                Minimum Amount Out (raw value)
              </label>
              <input
                id="amountOutMin"
                name="amountOutMin"
                defaultValue={node.data.node_data?.amountOutMin || "0"}
                onChange={handleInputChange}
                className="p-2 border rounded w-full mt-1"
                placeholder="e.g., 0"
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
