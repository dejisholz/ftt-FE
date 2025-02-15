import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { verifyUSDTTransaction, monitorTRC20Transactions } from "@/utils/tron-utils"


export default function PaymentForm(props: { paymentId: string | number }) {
    const [selectedPayment, setSelectedPayment] = useState('')
    const [transactionHash, setTransactionHash] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const { toast } = useToast()
  
    // Check if tgid is valid (not 'No ID Provided Yet')
    const isTgidValid = props.paymentId !== 'No ID Provided Yet';
  
    // Show warning toast when invalid tgid tries to interact
    const handleInvalidTgid = () => {
      toast({
        title: "⚠️ TradeTutor ID Required",
        description: "Please start the bot first to get your TradeTutor ID",
        variant: "destructive",
      });
    };
  
    // Function to request invite link from bot
    const requestInviteLink = useCallback(async (userId: string | number) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/bot/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query: {
              from: { id: userId },
              data: 'payment_verified'
            }
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate invite link');
        }
  
        const data = await response.json();
        if (data.success && data.inviteLink) {
          setInviteLink(data.inviteLink);
          toast({
            title: "🎉 Channel Invite Ready!",
            description: "Click the link below to join our VIP channel",
          });
        } else if (data.isInChannel) {
          toast({
            title: "✅ Already a Member",
            description: "You are already a member of our VIP channel!",
          });
        }
      } catch (error) {
        console.error('Error requesting invite link:', error);
        toast({
          title: "❌ Error",
          description: "Failed to generate channel invite. Please check your Telegram messages or contact support.",
          variant: "destructive",
        });
      }
    }, [toast, setInviteLink]);
  
    // Start monitoring transactions when payment method is selected
    useEffect(() => {
      if (selectedPayment === 'usdt_trc20' && !isMonitoring) {
        setIsMonitoring(true);
        const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS || '';
        
        const cleanup = monitorTRC20Transactions(
          merchantAddress,
          (transaction) => {
            // When a new transaction is detected, verify if it matches our expected amount
            if (transaction.value === '25000000') { // 25 USDT (6 decimals)
              toast({
                title: "✅ Payment Detected!",
                description: "Verifying your transaction...",
              });
              
              // Verify the transaction
              verifyUSDTTransaction(
                transaction.transaction_id,
                25,
                merchantAddress
              ).then((isValid) => {
                if (isValid) {
                  toast({
                    title: "🎉 Payment Confirmed!",
                    description: "Generating your channel invite...",
                  });
                  // Request invite link from bot
                  requestInviteLink(props.paymentId);
                }
              });
            }
          },
          10000 // Check every 10 seconds
        );
  
        return () => {
          cleanup();
          setIsMonitoring(false);
        };
      }
    }, [selectedPayment, toast, props.paymentId, isMonitoring, requestInviteLink]);
  
    // Handle manual transaction hash verification
    const handleVerifyTransaction = async () => {
      if (!transactionHash) {
        toast({
          title: "⚠️ Error",
          description: "Please enter a transaction hash",
          variant: "destructive",
        });
        return;
      }
  
      setIsVerifying(true);
      try {
        const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS || '';
        const isValid = await verifyUSDTTransaction(
          transactionHash,
          25, // Expected amount in USDT
          merchantAddress
        );
  
        if (isValid) {
          toast({
            title: "✅ Payment Verified!",
            description: "Generating your channel invite...",
          });
          // Request invite link from bot
          await requestInviteLink(props.paymentId);
        } else {
          toast({
            title: "❌ Verification Failed",
            description: "The transaction could not be verified. Please check the transaction hash and try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };
  
    return (
      <div className="mt-12 bg-[#2A1245] rounded-xl p-6">
        <input
          type="text"
          value={props.paymentId}
          readOnly
          className={`w-full bg-gray-700 rounded px-4 py-3 mb-4 text-center text-base md:text-lg ${
            !isTgidValid ? 'text-red-400' : ''
          }`}
        />
        <p className="text-center text-sm md:text-base text-gray-400 mb-4">
          Your TradeTutor ID: {props.paymentId}
        </p>
        
        <div className="relative mb-6">
          <select 
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            onClick={() => !isTgidValid && handleInvalidTgid()}
            disabled={!isTgidValid}
            className={`w-full bg-white text-gray-900 rounded px-4 py-3 text-base pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              !isTgidValid ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <option value="">- Mode Of Payment -</option>
            <option value="usdt_trc20">USDT (TRC20)</option>
          </select>
          {!isTgidValid && (
            <p className="text-xs text-red-400 mt-2">
              ⚠️ Please interact with the TradeTutor bot first to get your ID
            </p>
          )}
        </div>
  
        {selectedPayment === 'usdt_trc20' && (
          <div className="space-y-6 mb-6">
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold">Send Exactly</p>
              <p className="text-3xl font-bold text-teal-400">25 usdt</p>
              <div className="flex items-center justify-center gap-2 bg-black/30 p-3 rounded-lg">
                <input
                  type="text"
                  value="TCRntw5B9QCUdmA6FcNZWKQPs621iH83ja"
                  readOnly
                  className="bg-transparent text-white text-center flex-1 outline-none text-[10px] md:text-base lg:text-lg"
                />
                <button 
                  className="text-teal-400 hover:text-teal-300"
                  onClick={() => {
                    navigator.clipboard.writeText("TCRntw5B9QCUdmA6FcNZWKQPs621iH83ja")
                    toast({
                      title: "✔️ Copied to clipboard",
                    })
                  }}
                >
                  <span className="material-icons">content_copy</span>
                </button>
              </div>
              <p className="text-red-400 text-sm">
                *Make sure to select the <span className="text-orange-500">TRON(TRC20)</span> Network, if you are transferring from Bybit, Binance or any Crypto Exchange*
              </p>
            </div>
  
            <div className="space-y-2">
              <p className="text-center text-gray-300">Your Valid Transaction Hash</p>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter your transaction hash"
                className="w-full bg-gray-700 rounded px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}
  
        <Button 
          className={`w-full ${
            selectedPayment && !isVerifying
              ? 'bg-teal-500 hover:bg-teal-600' 
              : 'bg-gray-500 cursor-not-allowed'
          } h-12 text-base flex items-center justify-center gap-2`}
          disabled={!selectedPayment || isVerifying}
          onClick={handleVerifyTransaction}
        >
          {isVerifying ? (
            <>
              Verifying Payment
              <span className="material-icons animate-spin">refresh</span>
            </>
          ) : (
            <>
              I have made the payment
              <span className="material-icons">done_all</span>
            </>
          )}
        </Button>
  
        {inviteLink && (
          <div className="mt-6 p-4 bg-teal-500/20 rounded-lg text-center space-y-4">
            <h3 className="text-xl font-semibold text-teal-400">🎉 Your VIP Channel Invite is Ready!</h3>
            <p className="text-sm text-gray-300">
              Click the button below to join our VIP channel. This link will expire in 24 hours.
            </p>
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 h-12 text-base flex items-center justify-center gap-2"
              onClick={() => window.open(inviteLink, '_blank')}
            >
              Join VIP Channel
              <span className="material-icons">telegram</span>
            </Button>
            <p className="text-xs text-gray-400">
              A copy of this invite link has also been sent to your Telegram account.
            </p>
          </div>
        )}
      </div>
    )
  }
