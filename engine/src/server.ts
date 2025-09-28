import express from "express";
import cors from "cors";
import { parse_workflow } from "./json_parser/parser.js";
import { Workflow } from "./components/Workflow.js";

const app = express();
const user_workflows: Record<string, Workflow> = {};

// Enable CORS for all routes
app.use(
  cors({
    origin: "*", // Allow both frontend and any local development
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check endpoint for Cloud Run
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "Server is running", timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/status", (req, res) => {
  const walletaddr = req.query.wallet as string;

  if (!walletaddr) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  if (user_workflows[walletaddr]) {
    const currentStatus = user_workflows[walletaddr].status;
    res.status(200).json({ currentNode: currentStatus });
  } else {
    res.status(404).json({ currentNode: null });
  }
});

app.post("/workflow", async (req, res) => {
  try {
    const { json_workflow } = req.body;
    console.log("Received workflow:", JSON.stringify(json_workflow));

    const constructed_workflow: Workflow = parse_workflow(json_workflow);
    user_workflows[json_workflow.walletaddr] = constructed_workflow;
    user_workflows[json_workflow.walletaddr]?.start();

    res.status(200).json({ parsed: "Success" });
  } catch (error) {
    console.error("Error processing workflow:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/status", (req, res) => {
  const { walletaddr } = req.body;

  if (user_workflows[walletaddr]) {
    const currentStatus = user_workflows[walletaddr].status;
    res.status(200).json({ status: currentStatus });
  } else {
    console.log(`[STATUS POST] No workflow found for wallet: ${walletaddr}`);
    res
      .status(400)
      .json({ status: "No workflow for this wallet address found" });
  }
});

app.post("/stop", (req, res) => {
  const { walletaddr } = req.body;

  if (user_workflows[walletaddr]) {
    user_workflows[walletaddr].type = "once";
    res.status(200).json({ result: "Workflow will stop after this run" });
  } else {
    res
      .status(400)
      .json({ result: "No workflow for this wallet address found" });
  }
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const port = process.env.PORT || 8080;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default app;
