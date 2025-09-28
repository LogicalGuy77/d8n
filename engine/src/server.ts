import express from "express";
import cors from "cors";
import { parse_workflow } from "./json_parser/parser.js";
import { Workflow } from "./components/Workflow.js";

const app = express();
const port = 3000;

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

app.get("/status", (req, res) => {
  const walletaddr = req.query.wallet as string;
  // console.log(`[STATUS] Request received for wallet: ${walletaddr}`);

  if (!walletaddr) {
    // console.log(`[STATUS] No wallet address provided`);
    return res.status(400).json({ error: "Wallet address is required" });
  }

  if (user_workflows[walletaddr]) {
    const currentStatus = user_workflows[walletaddr].status;
    // console.log(`[STATUS] Wallet ${walletaddr} - Current executing node: ${currentStatus || 'none'}`);
    res.status(200).json({ currentNode: currentStatus });
  } else {
    // console.log(`[STATUS] No workflow found for wallet: ${walletaddr}`);
    res.status(404).json({ currentNode: null });
  }
});

app.post("/workflow", async (req, res) => {
  const { json_workflow } = req.body;
  console.log("Received workflow:", JSON.stringify(json_workflow));
  const constructed_workflow: Workflow = parse_workflow(json_workflow);

  user_workflows[json_workflow.walletaddr] = constructed_workflow;
  user_workflows[json_workflow.walletaddr]?.start();
  res.status(200).json({ parsed: "Success" });
});

app.post("/status", (req, res) => {
  const { walletaddr } = req.body;
  // console.log(`[STATUS POST] Request received for wallet: ${walletaddr}`);

  if (user_workflows[walletaddr]) {
    const currentStatus = user_workflows[walletaddr].status;
    // console.log(
    // `[STATUS POST] Wallet ${walletaddr} - Current executing node: ${
    //   currentStatus || "none"
    // }`
    // );
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

app.listen(port, () => {
  console.log(`Starting engine on port ${port}`);
});

