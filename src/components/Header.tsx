"use client"

import { useState, useRef, useEffect } from 'react';
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
import { transferUSDT } from "@/utils/tron-utils"
import { useToast } from "@/hooks/use-toast"

interface WalletWithTronWeb {
  tronWeb?: TronWeb;
}

declare global {
  interface Window {
    tronWeb: TronWeb;
    tronLink: any;
  }
}

const Header = () => {
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTronLink = async () => {
      try {
        // First check if TronLink is installed
        if (!window.tronLink) {
          console.log('Please install TronLink');
          return;
        }

        // Wait for TronLink to inject tronWeb
        let tronWebState = {
          installed: !!window.tronWeb,
          loggedIn: window.tronWeb && window.tronWeb.ready
        };

        if (!tronWebState.installed) {
          let tries = 0;
          const maxTries = 10;
          
          while (!tronWebState.installed && tries < maxTries) {
            tronWebState = {
              installed: !!window.tronWeb,
              loggedIn: window.tronWeb && window.tronWeb.ready
            };
            await new Promise(resolve => setTimeout(resolve, 1000));
            tries++;
          }
        }

        // Check if we're already logged in
        if (tronWebState.loggedIn) {
          const currentAddress = window.tronWeb.defaultAddress.base58;
          console.log('Already logged in:', currentAddress);
          setAddress(currentAddress);
          setConnected(true);
        }

        // Listen for account changes
        window.addEventListener('message', (e) => {
          if (e.data.message && e.data.message.action === "setAccount") {
            const address = e.data.message.data.address;
            setAddress(address);
            setConnected(true);
            console.log('Account changed:', address);
          }
          if (e.data.message && e.data.message.action === "setNode") {
            console.log('Network changed:', e.data.message.data.node);
          }
          if (e.data.message && e.data.message.action === "disconnect") {
            setAddress('');
            setConnected(false);
            console.log('Disconnected');
          }
        });

      } catch (error) {
        console.error('Error checking TronLink:', error);
      }
    };

    checkTronLink();
  }, []);

  const handleConnect = async () => {
    try {
      // Check if TronLink is installed
      if (!window.tronLink) {
        console.log('TronLink not found');
        setShowDialog(true);
        return;
      }

      try {
        // Request account access
        const account = await window.tronLink.request({
          method: 'tron_requestAccounts'
        });

        if (!account) {
          throw new Error('No account found');
        }

        // Wait for tronWeb to be injected
        let tries = 0;
        while (!window.tronWeb?.ready && tries < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          tries++;
        }

        if (!window.tronWeb?.ready) {
          throw new Error('TronWeb not ready');
        }

        const address = window.tronWeb.defaultAddress.base58;
        console.log('Connected address:', address);
        setAddress(address);
        setConnected(true);
        
        toast({
          title: "Connected Successfully",
          description: "Your wallet is now connected",
        });

      } catch (error) {
        console.error('TronLink request error:', error);
        toast({
          title: "Connection Failed",
          description: "Please unlock your TronLink wallet and try again",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Please make sure TronLink is installed and unlocked",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS;
      
      if (!merchantAddress) {
        throw new Error('Merchant address not configured');
      }

      if (!window.tronWeb) {
        throw new Error('No active wallet found');
      }

      toast({
        title: "Processing Payment",
        description: "Please confirm the transaction in your wallet...",
      });

      const txHash = await transferUSDT(window.tronWeb, 25, merchantAddress);

      toast({
        title: "Payment Successful!",
        description: "Redirecting to Telegram bot...",
      });

      window.location.href = `https://t.me/freetutorbottest_bot?start=paid_online=${txHash}`;

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
              {connected ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </span>
                  <Button
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
                  </Button>
                  <Button
                    onClick={() => {
                      setAddress('');
                      setConnected(false);
                      toast({
                        title: "Disconnected",
                        description: "Your wallet has been disconnected",
                      });
                    }}
                    variant="outline"
                    className="px-3 py-2 rounded-lg text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                  >
                    <span className="material-icons text-sm">logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnect}
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
