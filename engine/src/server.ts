import express from 'express';
import { parse_workflow } from './json_parser/parser.js';
import { Workflow } from './components/Workflow.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/status', (req, res) => {
    res.status(200).json({status: "Running"});
})

app.post('/test', async (req, res) => {
    const {json_workflow} = req.body;
    const constructed_workflow: Workflow = parse_workflow(json_workflow);

    await constructed_workflow.start();
    res.status(200).json({"parsed": "Success"});
})

app.listen(port, () => {
    console.log(`Starting engine on port ${port}`);
})