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
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow both frontend and any local development
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/status", (req, res) => {
  res.status(200).json({ status: "Running" });
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
  if(user_workflows[walletaddr]){
    res.status(200).json({status: user_workflows[walletaddr].status});
  }
  else{
    res.status(400).json({status: "No workflow for this wallet address found"});
  }
});

app.post("/stop", (req, res) => {
  const { walletaddr} = req.body;
  if(user_workflows[walletaddr]){
    user_workflows[walletaddr].type = "once";
    res.status(200).json({result: "Workflow will stop after this run"});
  }
  else{
    res.status(400).json({result: "No workflow for this wallet address found"});
  }
})

app.listen(port, () => {
  console.log(`Starting engine on port ${port}`);
});
