import React, { useState } from "react";
import { X, FileText, Play } from "lucide-react";
import {
  buyTheDipTemplate,
  takeProfitTemplate,
  priceRangeAlertTemplate,
} from "../constants/workflowTemplate";

const templates = [
  buyTheDipTemplate,
  takeProfitTemplate,
  priceRangeAlertTemplate,
];

export default function TemplateModal({ isOpen, onClose, onLoadTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (!isOpen) return null;

  const handleLoadTemplate = (template) => {
    onLoadTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Workflow Templates
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Template List */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Available Templates
            </h3>
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-4 rounded-lg border mb-3 transition-all duration-200 ${
                  selectedTemplate === template
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>{template.nodes.length} nodes</span>
                      <span>{template.edges.length} connections</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Template Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedTemplate ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedTemplate.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedTemplate.nodes.length} nodes
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {selectedTemplate.edges.length} connections
                    </span>
                  </div>
                </div>

                {/* Nodes Overview */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    Nodes in this workflow:
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.nodes.map((node, index) => (
                      <div
                        key={node.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="min-w-8 min-h-8 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-800 break-words">
                            {node.data.label}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Type:{" "}
                            <span className="font-mono text-blue-600">
                              {node.type}
                            </span>
                          </p>
                          {node.data.node_data &&
                            Object.keys(node.data.node_data).length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-gray-500 break-all">
                                  Config: {JSON.stringify(node.data.node_data)}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Flow */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    Workflow Flow:
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.edges.map((edge) => {
                      const sourceNode = selectedTemplate.nodes.find(
                        (n) => n.id === edge.source
                      );
                      const targetNode = selectedTemplate.nodes.find(
                        (n) => n.id === edge.target
                      );
                      return (
                        <div
                          key={edge.id}
                          className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">
                            {sourceNode?.data.label}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">
                            {targetNode?.data.label}
                          </span>
                          {edge.label && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {edge.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Load Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleLoadTemplate(selectedTemplate)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    <Play size={18} />
                    Load Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a template to view details</p>
                  <p className="text-sm mt-2">
                    Choose from the available workflow templates on the left
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
