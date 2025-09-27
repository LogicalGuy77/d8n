export const poolManagerAbi = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "currency0", "type": "address" },
          { "internalType": "address", "name": "currency1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickSpacing", "type": "int24" },
          { "internalType": "address", "name": "hooks", "type": "address" }
        ],
        "internalType": "struct PoolKey",
        "name": "key",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "bool", "name": "zeroForOne", "type": "bool" },
          { "internalType": "int256", "name": "amountSpecified", "type": "int256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct IPoolManager.SwapParams",
        "name": "params",
        "type": "tuple"
      },
      { "internalType": "bytes", "name": "hookData", "type": "bytes" }
    ],
    "name": "swap",
    "outputs": [
      {
        "components": [
          { "internalType": "int128", "name": "amount0", "type": "int128" },
          { "internalType": "int128", "name": "amount1", "type": "int128" }
        ],
        "internalType": "struct BalanceDelta",
        "name": "swapDelta",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
