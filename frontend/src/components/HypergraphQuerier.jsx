import { useState } from "react";
import { Graph } from "@graphprotocol/grc-20";
import { Search, Loader2, X } from "lucide-react";

// A sample workflow data object to use for the mock response
const mockWorkflowData = {
  walletaddr: "0x1234567890123456789012345678901234567890",
  type: "once",
  name: "Mock Workflow from Mock API",
  nodes: {
    "node-1": {
      position: { x: 100, y: 100 },
      label: "Start Node",
      type: "input",
      node_data: { value: "Hello" },
      inputs: [],
      outputs: ["output-1"],
    },
    "node-2": {
      position: { x: 400, y: 100 },
      label: "End Node",
      type: "output",
      node_data: {},
      inputs: ["input-1"],
      outputs: [],
    },
  },
  edges: {
    "node-1": {
      "node-2": {
        "output-1": "input-1",
      },
    },
  },
};

// This simulates the structure of the GraphQL API response
const mockApiResponse = {
  data: {
    entities: [
      {
        id: "mock-entity-id",
        name: "Mock Workflow",
        description: JSON.stringify(mockWorkflowData),
      },
    ],
  },
};

export default function HypergraphQuerier() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceId, setSpaceId] = useState("");
  const [workflowData, setWorkflowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useMockApi, setUseMockApi] = useState(true); // Toggle for using the mock

  const handleQuery = async () => {
    if (!spaceId.trim() && !useMockApi) {
      setError("Please enter a valid Space ID.");
      return;
    }
    setIsLoading(true);
    setWorkflowData(null);
    setError("");

    // --- MOCK API LOGIC ---
    if (useMockApi) {
      setTimeout(() => {
        // Simulate network delay
        try {
          const entities = mockApiResponse.data.entities;
          const entity = entities[0];
          const parsedData = JSON.parse(entity.description);
          setWorkflowData(parsedData);
        } catch (mockError) {
          setError("Failed to parse mock data.");
          console.error("Mock API error:", mockError);
        } finally {
          setIsLoading(false);
        }
      }, 500);
      return;
    }
    // --- END MOCK API LOGIC ---

    // --- REAL API LOGIC ---
    const graphqlQuery = {
      query: `
        query GetEntitiesInSpace($spaceId: UUID!) {
          entities(filter: { spaceIds: { in: [$spaceId] } }) {
            id
            name
            description
          }
        }
      `,
      variables: {
        spaceId: spaceId.trim(),
      },
    };

    try {
      const response = await fetch(`${Graph.TESTNET_API_ORIGIN}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(graphqlQuery),
      });

      if (!response.ok) {
        throw new Error(`API error. Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map((e) => e.message).join("\n"));
      }

      const entities = result.data.entities;
      if (!entities || entities.length === 0) {
        throw new Error("No entities found in this space.");
      }

      const entity = entities[0];

      if (!entity || !entity.description) {
        throw new Error("Workflow data (entity description) not found.");
      }

      const parsedData = JSON.parse(entity.description);
      setWorkflowData(parsedData);
    } catch (err) {
      console.error("Failed to query Hypergraph:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setWorkflowData(null);
    setError("");
    setSpaceId("");
  };

  return (
    <>
      {/* Navbar Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 flex items-center gap-2"
      >
        <Search size={16} />
        Query Workflow
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Query Workflow from Hypergraph
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Input Section */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spaceId}
                  onChange={(e) => setSpaceId(e.target.value)}
                  placeholder="Enter Space ID"
                  className="flex-grow border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  disabled={isLoading || useMockApi}
                />
                <button
                  onClick={handleQuery}
                  disabled={isLoading}
                  className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Search size={16} />
                  )}
                  {isLoading ? "Querying..." : "Query"}
                </button>
              </div>

              {/* Mock API Toggle */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  id="mock-api-checkbox"
                  checked={useMockApi}
                  onChange={(e) => setUseMockApi(e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="mock-api-checkbox"
                  className="text-sm font-medium text-gray-700"
                >
                  Use Mock API (for testing)
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Workflow Data Display */}
              {workflowData && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-800">
                    Retrieved Workflow Data:
                  </h3>
                  <div className="bg-gray-50 border rounded-md p-4">
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">
                        Name:{" "}
                      </span>
                      <span className="text-gray-900">{workflowData.name}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">
                        Type:{" "}
                      </span>
                      <span className="text-gray-900">{workflowData.type}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">
                        Wallet:{" "}
                      </span>
                      <span className="text-gray-900 font-mono text-sm">
                        {workflowData.walletaddr}
                      </span>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                        View Raw JSON Data
                      </summary>
                      <pre className="bg-white border rounded p-3 mt-2 text-xs overflow-auto max-h-64">
                        {JSON.stringify(workflowData, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
