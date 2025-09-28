// src/components/ViewWorkflows.jsx

import { useState } from "react";
import { useAccount } from "wagmi";
import { BookUser, Loader2, X } from "lucide-react";

export default function ViewWorkflows({ onLoadWorkflow }) {
  const [isOpen, setIsOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const fetchWorkflows = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://d8n-dz9h.vercel.app/api/workflows/${address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch workflows.");
      }
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchWorkflows();
  };

  const handleLoad = (workflow) => {
    onLoadWorkflow(workflow);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-slate-600 text-white font-bold py-2 px-4 rounded hover:bg-slate-700 flex items-center gap-2"
      >
        <BookUser size={16} /> My Workflows
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">Your Saved Workflows</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : workflows.length > 0 ? (
                <ul className="space-y-2">
                  {workflows.map((flow) => (
                    <li key={flow._id}>
                      <button
                        onClick={() => handleLoad(flow)}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-blue-100 rounded-md border border-slate-200"
                      >
                        {flow.workflowName}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-slate-500 mt-8">
                  No workflows found for this wallet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
