// backend/server.js

const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3001; // Port for our backend server

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON bodies

// --- MongoDB Connection Details ---
const uri =
  "mongodb+srv://harshitacademia_db_user:i9B8EJejeTvBZEQw@decluster8n.htjwxef.mongodb.net/?retryWrites=true&w=majority&appName=decluster8n";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// --- API Endpoint to Save a Workflow ---
app.post("/api/workflows", async (req, res) => {
  const { user_wallet, workflow_name, workflow_data } = req.body;

  // Basic validation
  if (!user_wallet || !workflow_name || !workflow_data) {
    return res.status(400).json({ message: "Missing required workflow data." });
  }

  try {
    await client.connect();
    const db = client.db("d8n_main"); // Your database name
    const collection = db.collection("workflows"); // Your collection name

    // This query finds a workflow with the specific wallet address AND workflow name.
    const filter = {
      walletAddress: user_wallet,
      workflowName: workflow_name,
    };

    // This is the data that will be set or updated.
    const updateDoc = {
      $set: {
        walletAddress: user_wallet,
        workflowName: workflow_name,
        workflowData: workflow_data,
        updatedAt: new Date(),
      },
    };

    // Use upsert:true - this creates a new document if one doesn't exist.
    const options = { upsert: true };

    const result = await collection.updateOne(filter, updateDoc, options);

    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
    if (result.upsertedId) {
      console.log(`A new document was created with id: ${result.upsertedId}`);
    }

    res
      .status(201)
      .json({ message: "Workflow saved successfully!", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save workflow." });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// --- API Endpoint to GET all Workflows for a Wallet ---
app.get("/api/workflows/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required." });
  }

  try {
    await client.connect();
    const db = client.db("d8n_main");
    const collection = db.collection("workflows");

    // Find all documents that match the walletAddress
    const workflows = await collection
      .find({ walletAddress: walletAddress })
      .toArray();

    res.status(200).json(workflows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch workflows." });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`d8n backend server listening at http://localhost:${port}`);
});
