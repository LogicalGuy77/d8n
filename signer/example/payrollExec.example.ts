//@ts-nocheck
import { sepolia } from 'viem/chains';
import 'dotenv/config';
import { Hex, Address } from 'viem';
import { PayrollConfig , executePayroll } from '../workflowbuilders/payrollExec';

async function runPayroll() {
  const payrollConfig: PayrollConfig = {
    tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC Sepolia
    tokenDecimals: 6, // USDC has 6 decimals
    recipients: [
      {
        address: '0x742d35Cc6634C0532925a3b8D398B9d9a3F4A8a1',
        amount: '1000' // 1000 USDC
      },
      {
        address: '0x8ba1f109551bD432803012645Hac136c6a8f0DE',
        amount: '500' // 500 USDC
      }
    ]
  };

  try {
    const txHash = await executePayroll({
      privateKey: process.env.USER_PRIVATE_KEY as Hex,
      chain: sepolia,
      rpcUrl: process.env.SEPOLIA_RPC_URL!,
      delegateContractAddress: process.env.DELEGATE_CONTRACT_ADDRESS as Address,
      payrollConfig
    });
    
    console.log(`✅ Payroll executed! Tx: ${txHash}`);
  } catch (error) {
    console.error('❌ Payroll failed:', error);
  }
}
