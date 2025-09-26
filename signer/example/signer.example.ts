//@ts-nocheck
import { encodeFunctionData, Hex, Address } from 'viem';
import { polygonAmoy , sepolia} from 'viem/chains';
import 'dotenv/config';

// Import the main function and types from your SDK
import { executeWorkflow, Workflow } from '../src/signer'; 

// =============================================================================
// --- CONFIGURATION ---
// =============================================================================
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY as Hex;
const DELEGATE_CONTRACT_ADDRESS = process.env.DELEGATE_CONTRACT_ADDRESS as Address;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL; // fixed env var

if (!USER_PRIVATE_KEY || !DELEGATE_CONTRACT_ADDRESS || !SEPOLIA_RPC_URL) {
  throw new Error("Missing critical environment variables in .env file.");
}

// --- CONTRACT ADDRESSES & ABIS ---
const erc20Abi = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const USDC_ADDRESS_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const UNISWAP_UNIVERSAL_ROUTER = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';

// --- MAIN SCRIPT ---
async function main() {
  console.log('--- 🚀 Starting Direct Workflow Execution Script ---');

  // 1. Define the workflow
  const myWorkflow: Workflow = {
    actions: [
      {
        to: USDT_ADDRESS_AMOY,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [UNISWAP_UNIVERSAL_ROUTER, 1000000n] // Approve 1 USDT
        })
      }
      // You can add more actions here if needed
    ]
  };

  // 2. Execute the workflow via SDK
  try {
    const txHash = await executeWorkflow({
      privateKey: USER_PRIVATE_KEY,
      workflow: myWorkflow,
      chain: sepolia,
      rpcUrl: SEPOLIA_RPC_URL,
      delegateContractAddress: DELEGATE_CONTRACT_ADDRESS,
    });

    console.log(`\n✅ Workflow executed successfully!`);
    console.log(`   - Transaction Hash: ${txHash}`);
    if (sepolia.blockExplorers?.default)
      console.log(`   - Explorer URL: ${sepolia.blockExplorers.default.url}/tx/${txHash}`);
  } catch (err) {
    console.error('\n❌ Workflow execution failed.');
    console.error(err);
  }

  console.log('\n--- ✔️ Script Finished ---');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
