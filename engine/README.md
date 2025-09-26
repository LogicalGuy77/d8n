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