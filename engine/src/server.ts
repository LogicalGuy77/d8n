import express from "express";
import cors from "cors";
import { parse_workflow } from "./json_parser/parser.js";
import { Workflow } from "./components/Workflow.js";

const app = express();
const port = 3000;

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

app.post("/test", async (req, res) => {
  const { json_workflow } = req.body;
  console.log("Received workflow:", JSON.stringify(json_workflow));
  const constructed_workflow: Workflow = parse_workflow(json_workflow);

  constructed_workflow.start();
  res.status(200).json({ parsed: "Success" });
});

app.listen(port, () => {
  console.log(`Starting engine on port ${port}`);
});
