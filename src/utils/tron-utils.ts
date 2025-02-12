import type { TronWeb } from '@/types/tronweb';

interface TRC20Transaction {
  transaction_id: string;
  token_info: {
    symbol: string;
    address: string;
    decimals: number;
    name: string;
  };
  block_timestamp: number;
  from: string;
  to: string;
  type: string;
  value: string;
}

interface TransactionScannerOptions {
  address: string;
  contractAddress: string;
  minTimestamp?: number;
  onlyConfirmed?: boolean;
}

interface TransferEvent {
  event_name: string;
  contract_address: string;
  result: {
    to: string;
    value: string;
  };
}

/**
 * Scans for TRC20 transactions for a specific address
 * @param options Scanner options including address and contract address
 * @returns Array of transactions matching the criteria
 */
export async function scanTRC20Transactions(options: TransactionScannerOptions): Promise<TRC20Transaction[]> {
  const {
    address,
    contractAddress,
    minTimestamp = Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours by default
    onlyConfirmed = true
  } = options;

  try {
    // Using TRON Grid API
    const params = new URLSearchParams({
      only_confirmed: onlyConfirmed.toString(),
      min_timestamp: minTimestamp.toString(),
      contract_address: contractAddress,
      limit: '50',
      order_by: 'block_timestamp,desc'
    });

    const response = await fetch(
      `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?${params}`,
      {
        headers: {
          'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRONGRID_API_KEY || ''
        },
        next: { revalidate: 0 } // Disable cache
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error scanning TRC20 transactions:', error);
    throw error;
  }
}

/**
 * Verifies if a specific transaction exists and matches the expected amount
 * @param txHash Transaction hash to verify
 * @param expectedAmount Expected amount in USDT (will be converted to smallest unit)
 * @param recipientAddress Expected recipient address
 * @returns boolean indicating if transaction is valid
 */
export async function verifyUSDTTransaction(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}/events`, {
      headers: {
        'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRONGRID_API_KEY || ''
      },
      next: { revalidate: 0 } // Disable cache
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const events = data.data;
    if (!events || events.length === 0) return false;

    // Convert expected amount to smallest unit (USDT has 6 decimals)
    const expectedAmountInSmallestUnit = expectedAmount * Math.pow(10, 6);

    // Find the Transfer event
    const transferEvent = events.find((event: TransferEvent) => 
      event.event_name === 'Transfer' &&
      event.contract_address.toLowerCase() === process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS?.toLowerCase()
    );

    if (!transferEvent) return false;

    // Verify recipient and amount
    return (
      transferEvent.result.to.toLowerCase() === recipientAddress.toLowerCase() &&
      Number(transferEvent.result.value) === expectedAmountInSmallestUnit
    );
  } catch (error) {
    console.error('Error verifying USDT transaction:', error);
    return false;
  }
}

/**
 * Formats a TRC20 amount from smallest unit to human readable format
 * @param amount Amount in smallest unit
 * @param decimals Number of decimals (6 for USDT)
 * @returns Formatted amount
 */
export function formatTRC20Amount(amount: string, decimals: number = 6): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Monitors for new TRC20 transactions
 * @param address Address to monitor
 * @param callback Callback function to execute when new transaction is found
 * @param interval Polling interval in milliseconds
 * @returns Cleanup function
 */
export function monitorTRC20Transactions(
  address: string,
  callback: (transaction: TRC20Transaction) => void,
  interval: number = 10000
): () => void {
  let lastTimestamp = Date.now();
  const contractAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || '';

  const intervalId = setInterval(async () => {
    try {
      const transactions = await scanTRC20Transactions({
        address,
        contractAddress,
        minTimestamp: lastTimestamp
      });

      for (const tx of transactions) {
        if (tx.block_timestamp > lastTimestamp) {
          callback(tx);
          lastTimestamp = tx.block_timestamp;
        }
      }
    } catch (error) {
      console.error('Error monitoring transactions:', error);
    }
  }, interval);

  return () => clearInterval(intervalId);
}

/**
 * Initiates a USDT transfer using TronWeb
 * @param tronWeb TronWeb instance
 * @param amount Amount in USDT
 * @param recipientAddress Recipient's address
 * @returns Transaction hash
 */
export async function transferUSDT(
  tronWeb: TronWeb,
  amount: number,
  recipientAddress: string
): Promise<string> {
  try {
    const usdtContractAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS;
    if (!usdtContractAddress) {
      throw new Error('USDT contract address not configured');
    }

    // Get contract instance
    const contract = await tronWeb.contract().at(usdtContractAddress);
    
    // Convert amount to smallest unit (USDT has 6 decimals)
    const amountInSmallestUnit = amount * Math.pow(10, 6);

    // Send transaction
    const transaction = await contract.transfer(
      recipientAddress,
      amountInSmallestUnit.toString()
    ).send();

    return transaction;
  } catch (error) {
    console.error('Error transferring USDT:', error);
    throw error;
  }
} 