//@ts-nocheck
import {
  createWalletClient,
  createPublicClient,
  http,
  Hex,
  Address,
  BaseError,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Chain } from 'viem/chains';

export interface ChimeraAction {
  to: Address;
  value?: bigint;
  data: Hex;
}

export interface Workflow {
  actions: ChimeraAction[];
}

export interface ExecutionOptions {
  privateKey: Hex;
  workflow: Workflow;
  chain: Chain;
  rpcUrl: string;
  delegateContractAddress: Address;
}

const delegateAbi = [
  {
    inputs: [
      {
        components: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
        name: 'actions',
        type: 'tuple[]',
      },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export async function executeWorkflow({
  privateKey,
  workflow,
  chain,
  rpcUrl,
  delegateContractAddress,
}: ExecutionOptions): Promise<Hex> {
  try {
    const account = privateKeyToAccount(privateKey);

    const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    console.log(`\n🤖 Executing workflow on chain ${chain.name} (${chain.id})`);
    console.log(`   - As user: ${account.address}`);
    console.log(`   - Via Delegate Contract: ${delegateContractAddress}`);

    const actionsTuples: { to: Address; value: bigint; data: Hex }[] =
      workflow.actions.map(a => ({
        to: a.to,
        value: BigInt(a.value ?? 0),
        data: a.data,
      }));

    console.log('📦 Actions to execute:');
    actionsTuples.forEach((a, i) => console.log(`  ${i + 1}:`, a));

    const { request } = await publicClient.simulateContract({
      account,
      address: delegateContractAddress,
      abi: delegateAbi,
      functionName: 'executeBatch',
      args: [actionsTuples as any], 
    });
    console.log('✅ Simulation successful. Prepared request:', request);

    const txHash = await walletClient.writeContract({
      address: delegateContractAddress,
      abi: delegateAbi,
      functionName: 'executeBatch',
      args: [actionsTuples as any],
    });

    console.log(`✅ Transaction submitted successfully!`);
    console.log(`   - Hash: ${txHash}`);
    if (chain.blockExplorers?.default)
      console.log(`   - Explorer: ${chain.blockExplorers.default.url}/tx/${txHash}`);

    return txHash;
  } catch (error) {
    console.error('\n❌ Workflow execution failed:');
    if (error instanceof BaseError) {
      const revert = error.walk(e => e.name === 'ContractFunctionRevertedError');
      if (revert && 'reason' in revert) {
        console.error(`   - Revert reason: ${revert.reason}`);
      } else {
        console.error(`   - Details: ${error.shortMessage}`);
      }
    } else {
      console.error(error);
    }
    throw error;
  }
}
