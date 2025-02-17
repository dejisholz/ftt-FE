interface Transaction {
    transaction_id: string;
    from: string;
    to: string;
    amount: string;
    timestamp: number;
  }
  
  export async function fetchTRC20Transactions(
    walletAddress: string
  ): Promise<Transaction[]> {
    try {
      // Using Tron Grid API endpoint (public)
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
  
      // Transform the response data into our Transaction interface
      return data.data.map((tx: any) => ({
        transaction_id: tx.transaction_id,
        from: tx.from,
        to: tx.to,
        amount: tx.value,
        timestamp: tx.block_timestamp,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching TRC20 transactions:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
      throw error;
    }
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
        (tx: any) => tx.transaction_id === txHash
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
    } catch (error) {
      return { success: false, message: "Error verifying transaction", amountMessage: "" };
    }
  }
  
  export type { Transaction };
  