import { useState, useEffect, useRef, useCallback } from "react";

export function useNodeStatus(walletAddress) {
  const [currentExecutingNode, setCurrentExecutingNode] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [workflowCompleted, setWorkflowCompleted] = useState(false);
  const intervalRef = useRef(null);
  const previousNodeRef = useRef(null);

  const fetchNodeStatus = useCallback(async () => {
    if (!walletAddress) return;

    try {
      console.log(`[FRONTEND] Polling status for wallet: ${walletAddress}`);
      const response = await fetch(
        `http://localhost:3000/status?wallet=${walletAddress}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`[FRONTEND] Status response:`, data);

        // The backend now returns { currentNode: "nodeId" } or { currentNode: null }
        const nodeId = data.currentNode;
        // console.log(`[FRONTEND] Current executing node: ${nodeId || "none"}`);

        // Detect workflow completion: previous node was executing, now it's null
        if (previousNodeRef.current && !nodeId) {
          console.log(
            `[FRONTEND] Workflow completed! Previous node: ${previousNodeRef.current}`
          );
          setWorkflowCompleted(true);
          // Reset the completed flag after a short delay
          setTimeout(() => setWorkflowCompleted(false), 100);
        }

        previousNodeRef.current = nodeId;
        setCurrentExecutingNode(nodeId);
      } else {
        console.log(
          `[FRONTEND] Status request failed with status: ${response.status}`
        );
        // If status endpoint returns error, reset current node
        setCurrentExecutingNode(null);
      }
    } catch (error) {
      console.error("[FRONTEND] Error fetching node status:", error);
      setCurrentExecutingNode(null);
    }
  }, [walletAddress]);

  const startPolling = () => {
    if (intervalRef.current || !walletAddress) return;

    setIsPolling(true);
    // Fetch immediately
    fetchNodeStatus();
    // Then poll every second
    intervalRef.current = setInterval(fetchNodeStatus, 1000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    setCurrentExecutingNode(null);
  };

  useEffect(() => {
    if (!walletAddress) {
      stopPolling();
      return;
    }

    // Start polling when wallet address is available
    if (intervalRef.current) return; // Already polling

    setIsPolling(true);
    // Fetch immediately
    fetchNodeStatus();
    // Then poll every second
    intervalRef.current = setInterval(fetchNodeStatus, 1000);

    // Cleanup on unmount or wallet address change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
      setCurrentExecutingNode(null);
    };
  }, [walletAddress, fetchNodeStatus]);

  return {
    currentExecutingNode,
    workflowCompleted,
    isPolling,
    startPolling,
    stopPolling,
  };
}
