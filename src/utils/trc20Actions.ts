interface Transaction {
    transaction_id: string;
    from: string;
    to: string;
    amount: string;
    timestamp: number;
  }

  interface TronGridTransaction {
    transaction_id: string;
    from: string;
    to: string;
    value: string;
    block_timestamp: number;
  }
  
  export async function fetchSpecificTransaction(
    walletAddress: string,
    txHash: string
  ): Promise<Transaction | null> {
    try {
      // First, let's try to find the transaction in the wallet's history
      const response = await fetch(
        `https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }
  
      const data = await response.json();
  
      if (!data.data || !Array.isArray(data.data)) {
        console.log("Raw API response:", data);
        throw new Error("Unexpected API response format");
      }
  
      // Find the specific transaction
      const transaction = data.data.find(
        (tx: TronGridTransaction) => tx.transaction_id === txHash
      );
  
      if (!transaction) {
        console.log("Transaction not found");
        return null;
      }
  
      return {
        transaction_id: transaction.transaction_id,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.value,
        timestamp: transaction.block_timestamp,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching transaction:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
      throw error;
    }
  }
  
  export async function verifyTransactionAmount(
    txHash: string,
    walletAddressReceiver: string
  ): Promise<{ success: boolean; message: string; amountMessage: string }> {
      let amount = 0;
      let amountMessage = "";
    try {
      const transaction = await fetchSpecificTransaction(walletAddressReceiver, txHash);
      if (!transaction) {
        return { success: false, message: "Transaction not found", amountMessage: "" };
      }
      const isSender = transaction.to === walletAddressReceiver;
      if (isSender) {
          amount = Number(transaction.amount) * 0.000001;
          if (amount >= 25) {
              amountMessage = "Verified Amount Sent";
          } else {
              amountMessage = "Invalid Amount Sent";
          }
      }
      return { 
        success: isSender, 
        message: isSender ? "Verified sender" : "Invalid sender",
        amountMessage: amountMessage
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, message: "Error verifying transaction: " + errorMessage, amountMessage: "" };
    }
  }
  
  export type { Transaction };
  