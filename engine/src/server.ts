import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/status', (req, res) => {
    res.status(200).json({status: "Running"});
})

app.listen(port, () => {
    console.log(`Starting engine on port ${port}`);
})