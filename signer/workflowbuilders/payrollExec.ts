import { encodeFunctionData, Hex, Address, parseUnits } from 'viem';
import { Chain } from 'viem/chains';
import { executeWorkflow, Workflow, ChimeraAction } from '../src/signer';

// =============================================================================
// --- PAYROLL SYSTEM ---
// =============================================================================

const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export interface PayrollRecipient {
  address: Address;
  amount: string; // Amount in human readable format (e.g., "100.5")
}

export interface PayrollConfig {
  tokenAddress: Address;
  tokenDecimals: number;
  recipients: PayrollRecipient[];
}

export interface PayrollExecutionOptions {
  privateKey: Hex;
  chain: Chain;
  rpcUrl: string;
  delegateContractAddress: Address;
  payrollConfig: PayrollConfig;
}

/**
 * Builds a payroll workflow that sends tokens to multiple recipients
 */
export function buildPayrollWorkflow(config: PayrollConfig): Workflow {
  const actions: ChimeraAction[] = config.recipients.map(recipient => ({
    to: config.tokenAddress,
    value: 0n, // ERC20 transfers don't send ETH
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [
        recipient.address,
        parseUnits(recipient.amount, config.tokenDecimals)
      ]
    })
  }));

  return { actions };
}

/**
 * Calculates total amount needed for payroll
 */
export function calculatePayrollTotal(recipients: PayrollRecipient[]): string {
  return recipients
    .reduce((total, recipient) => total + parseFloat(recipient.amount), 0)
    .toString();
}

/**
 * Executes payroll workflow
 */
export async function executePayroll(options: PayrollExecutionOptions): Promise<Hex> {
  console.log('\n💰 Building Payroll Workflow...');
  console.log(`   - Token: ${options.payrollConfig.tokenAddress}`);
  console.log(`   - Recipients: ${options.payrollConfig.recipients.length}`);
  
  const total = calculatePayrollTotal(options.payrollConfig.recipients);
  console.log(`   - Total Amount: ${total} tokens`);

  // Log recipients
  options.payrollConfig.recipients.forEach((recipient, i) => {
    console.log(`   ${i + 1}. ${recipient.address} → ${recipient.amount} tokens`);
  });

  const workflow = buildPayrollWorkflow(options.payrollConfig);

  return await executeWorkflow({
    privateKey: options.privateKey,
    workflow,
    chain: options.chain,
    rpcUrl: options.rpcUrl,
    delegateContractAddress: options.delegateContractAddress,
  });
}
