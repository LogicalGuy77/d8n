# Engine

This folder contains the core logic and workflow engine for the d8n project. It manages workflow execution, node components, and integration with smart contracts and external services.

## Structure
- `src/`: TypeScript source files for engine logic.
  - `components/`: Node components for workflow execution.
  - `constants/`: Constant values and IDs.
  - `interfaces/`: TypeScript interfaces for engine types.
  - `json_parser/`: JSON parsing utilities.
  - `schema/`: JSON schema definitions.
  - `signer/`: Signing utilities.
  - `workflow_executor/`: Workflow execution logic.
- `package.json`: Node.js dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the engine:
   ```bash
   npm run build
   ```
3. Start the engine:
   ```bash
   npm run prod
   ```

## Notes
- Written in TypeScript.
- See individual components for specific node logic.

# d8n engine
Parses workflows and executes them.

## Request  example
```
{
    "json_workflow": {
        "type": "repeat",
        "nodes": {
            "0": {
                "label": "BTC Price Feed",
                "type": "pyth",
                "node_data": {
                    "priceFeed": "BTC_USD"
                },
                "inputs": {},
                "outputs": {
                    "price": 0
                }
            },
            "1": {
                "label": "Price print",
                "type": "print",
                "node_data": {
                    "sample": "sample"
                },
                "inputs": {
                    "price": 0
                },
                "outputs": {}
            }
        },
        "edges": {
            "0": {
                "1": {
                    "price": "price"
                }
            }
        }
    }
}
```