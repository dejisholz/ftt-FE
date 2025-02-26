'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Faq from "@/components/pages/home/Faq";
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PaymentForm from "@/components/pages/home/PaymentForm"
import { useToast } from "@/hooks/use-toast"
import { transferUSDT } from "@/utils/tron-utils"
import { useWallet } from '@/contexts/WalletContext';
import PaymentClosed from "@/components/reusables/PaymentClosed";
// import { getPaymentWindowStatus } from "@/utils/payment-window";

// Create a separate component for the content that uses useSearchParams
const HomeContent = () => {
  const searchParams = useSearchParams()
  const paymentRef = useRef<HTMLDivElement>(null)
  const [tgid, setTgid] = useState<string | null>(null)
  const { toast } = useToast()
  const { isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // const { isOpen } = getPaymentWindowStatus();
  const isOpen = true;

  useEffect(() => {
    // Get tgid from URL parameters
    const urlTgid = searchParams.get('tgid')
    if (urlTgid) {
      setTgid(urlTgid)
      // Check if URL has #payment hash and scroll to payment section
      if (window.location.hash === '#payment' && paymentRef.current) {
        paymentRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen text-white px-4 py-20 md:py-20 lg:py-24">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-black/30 p-4 rounded-lg inline-block">
          Welcome to FreeTradeTutor
          <br />
          Premium membership page
        </h1>
        <p className="text-lg mb-8 bg-black/30 p-3 rounded-lg inline-block">Join our Premium Telegram Channel</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
          <Button 
            variant="default" 
            className="bg-pink-600 hover:bg-pink-700 h-16 text-lg flex items-center justify-center gap-2"
            onClick={() => window.open('https://t.me/bo_foreignexchangetrader', '_blank')}
          >
            <span className="material-icons">headset_mic</span>
            SUPPORT TEAM
          </Button>
          
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 h-16 text-lg flex items-center justify-center gap-2"
            onClick={() => window.open('https://t.me/BTradingVIP_Bot', '_blank')}
          >
            <span className="material-icons">send</span>
            SUBSCRIBE NOW
          </Button>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="max-w-sm mx-auto bg-[#0F0518] rounded-2xl p-6 mb-12">
        <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold">$25</span>
          <span className="text-gray-400 ml-2">/ month</span>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="material-icons text-teal-400">headset_mic</span>
            <span>Direct Support</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-icons text-teal-400">trending_up</span>
            <span>Live Trading Session</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-icons text-teal-400">signal_cellular_alt</span>
            <span>Daily Trade Signals</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-icons text-teal-400">calendar_today</span>
            <span>Trading 5 Days A Week</span>
          </div>
        </div>

        <Button className="w-full bg-teal-500 hover:bg-teal-600 h-12 text-lg"
                disabled={isProcessing}
                onClick={async () => {
                  if (!isConnected || !window.tronWeb || !window.tronWeb.ready || !window.tronWeb.defaultAddress?.base58) {
                    // If wallet is not connected, redirect to Telegram bot
                    window.open('https://t.me/BTradingVIP_Bot', '_blank');
                    return;
                  }

                  try {
                    setIsProcessing(true);
                    const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS as string;
                    
                    if (!merchantAddress) {
                      throw new Error('Merchant address not configured');
                    }

                    // Validate merchant address format
                    try {
                      window.tronWeb.address.toHex(merchantAddress);
                    } catch {
                      throw new Error('Invalid merchant address format');
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

                    // Redirect to bot with payment success parameters
                    window.location.href = `https://t.me/BTradingVIP_Bot?start=payment_success_${txHash}`;
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
                }}>
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="material-icons animate-spin">refresh</span>
              Processing...
            </span>
          ) : isConnected ? 'Pay 25 USDT' : 'Get Access'}
        </Button>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 italic bg-black/30 p-3 rounded-lg inline-block">
          Join Our Premium Telegram Channel <span className="text-blue-400">✈</span>
        </h2>
        
        <p className="text-gray-300 mb-8 bg-black/30 p-4 rounded-lg">
          You now have the opportunity to experience a one-on-one live trading session with me, 
          where you&apos;ll take trades along with me, thereby enabling higher win ratio in your trading 
          journey even as a newbie.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#2A1245] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-teal-400">trending_up</span>
              <h3 className="text-xl font-semibold">Live Trading Session</h3>
            </div>
            <p className="text-gray-300">Access to one-on-one live trading</p>
          </div>

          <div className="bg-[#2A1245] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-teal-400">headset_mic</span>
              <h3 className="text-xl font-semibold">Direct Support</h3>
            </div>
            <p className="text-gray-300">One-on-One support from our team.</p>
          </div>

          <div className="bg-[#2A1245] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-teal-400">signal_cellular_alt</span>
              <h3 className="text-xl font-semibold">Access to Daily Trade Signals</h3>
            </div>
            <p className="text-gray-300">Access to the Latest Trading Strategies</p>
          </div>

          <div className="bg-[#2A1245] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-teal-400">calendar_today</span>
              <h3 className="text-xl font-semibold">Trading 5 Days A Week</h3>
            </div>
            <p className="text-gray-300">We&apos;ll Trade From Mondays To Fridays so as to maximize profits</p>
          </div>
        </div>
      </div>

      {/* Subscription Steps */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 bg-black/30 p-3 rounded-lg inline-block">
          TradeTutor Membership Subscription
        </h2>
        
        <p className="text-gray-300 mb-8 bg-black/30 p-4 rounded-lg">
          Please read through the steps provided, then begin the payment process
        </p>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-700"></div>

          <div className="space-y-12">
            <div className="space-y-12">
              <div className="relative flex items-start gap-4">
                <div className="flex-none">
                  <div className="w-12 h-12 rounded-full bg-[#2A1245] flex items-center justify-center">
                    <span className="material-icons text-yellow-500">👑</span>
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg flex-1">
                  <h3 className="text-xl font-semibold mb-2">Step 1</h3>
                  <p className="text-gray-300">
                    Generate your unique TradeTutor ID, by interacting with the{' '}
                    <Link href="#" className="text-teal-400 hover:underline">
                      TradeTutor Membership Bot
                    </Link>
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="flex-none">
                  <div className="w-12 h-12 rounded-full bg-[#2A1245] flex items-center justify-center">
                    <span className="material-icons text-yellow-500">visibility</span>
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg flex-1">
                  <h3 className="text-xl font-semibold mb-2">Step 2</h3>
                  <p className="text-gray-300">
                    Navigate to the payment section on the home page, and select the preferred payment 
                    cryptocurrency. Supported cryptocurrency is UsDt{' '}
                    <span className="inline-block w-6 h-6 align-text-bottom">💲</span>
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="flex-none">
                  <div className="w-12 h-12 rounded-full bg-[#2A1245] flex items-center justify-center">
                    <span className="material-icons text-yellow-500">account_balance_wallet</span>
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg flex-1">
                  <h3 className="text-xl font-semibold mb-2">Step 3</h3>
                  <p className="text-gray-300">
                    Transfer the exact crypto amount that is generated to the wallet address provided.
                    <br />
                    <span className="text-red-400">*Make sure to select the </span>
                    <span className="text-orange-500">TRON(TRC20)</span>
                    <span className="text-red-400"> Network, if you are transferring from Bybit, 
                    Binance or any Crypto Exchange*</span>
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4" ref={paymentRef}>
                <div className="flex-none">
                  <div className="w-12 h-12 rounded-full bg-[#2A1245] flex items-center justify-center">
                    <span className="material-icons text-yellow-500">done_all</span>
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg flex-1">
                  <h3 className="text-xl font-semibold mb-2">Step 4</h3>
                  <p className="text-gray-300">
                    Paste the Transaction Hash of your transfer, to the field provided, and click
                    <span className="text-teal-400">&quot;I have made the payment&quot;</span>
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="flex-none">
                  <div className="w-12 h-12 rounded-full bg-[#2A1245] flex items-center justify-center">
                    <span className="material-icons text-teal-400">check_circle</span>
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg flex-1">
                  <h3 className="text-xl font-semibold mb-2">Success</h3>
                  <p className="text-gray-300">
                    The TradeTutor will inbox you with a Link to join the group. The link lasts for 
                    only 30mins, and is valid for a one time entry by your Telegram account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          {isOpen && <PaymentForm paymentId={tgid || 'No ID Provided Yet'} />}
          {!isOpen && <PaymentClosed />}
        </div>
      </div>

      {/* FAQ Section */}
      <Faq />
    </div>
  )
}

// Main component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
