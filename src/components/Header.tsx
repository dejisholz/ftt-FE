"use client"

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { TronWeb } from '@/types/tronweb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { transferUSDT } from "@/utils/tron-utils"
// import { useToast } from "@/hooks/use-toast"
import { useWallet } from '@/contexts/WalletContext';

declare global {
  interface Window {
    tronWeb: TronWeb;
    tronLink: {
      request: (params: { method: string }) => Promise<string[]>;
    };
  }
}

const Header = () => {
//   const { toast } = useToast()
  const [showDialog, setShowDialog] = useState<boolean>(false);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isConnected, address, connect, disconnect } = useWallet();

//   const handlePayment = async () => {
//     try {
//       setIsProcessing(true);
//       const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS;
      
//       if (!merchantAddress) {
//         throw new Error('Merchant address not configured');
//       }

//       if (!window.tronWeb) {
//         throw new Error('No active wallet found');
//       }

//       toast({
//         title: "Processing Payment",
//         description: "Please confirm the transaction in your wallet...",
//       });

//       const txHash = await transferUSDT(window.tronWeb, 25, merchantAddress);

//       toast({
//         title: "Payment Successful!",
//         description: "Redirecting to Telegram bot...",
//       });

//       window.location.href = `https://t.me/freetutorbottest_bot?start=paid_online=${txHash}`;

//     } catch (error) {
//       console.error('Payment error:', error);
//       toast({
//         title: "Payment Failed",
//         description: error instanceof Error ? error.message : "An unknown error occurred",
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 h-12">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center">
              <Image src="/logo.jpeg" alt="Trade Tutor" width={40} height={40} />
              <h1 className="text-2xl font-bold text-gray-200">Trade Tutor</h1>
            </div>

            {/* Wallet Connection */}
            <div className="relative" ref={dropdownRef}>
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </span>
                  {/* <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors duration-200"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="material-icons animate-spin">refresh</span>
                        Processing...
                      </span>
                    ) : (
                      "Pay 25 USDT"
                    )}
                  </Button> */}
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    className="px-3 py-2 rounded-lg text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                  >
                    <span className="material-icons text-sm">logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connect}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                >
                  Connect TronLink
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* TronLink Not Detected Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>TronLink Not Detected</DialogTitle>
            <DialogDescription>
              Please install TronLink wallet and unlock it to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => {
                  window.open('https://www.tronlink.org/', '_blank');
                  setShowDialog(false);
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Install TronLink
              </button>
              <button
                onClick={() => setShowDialog(false)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
