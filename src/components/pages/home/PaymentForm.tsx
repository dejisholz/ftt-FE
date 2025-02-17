import { Button } from "@/components/ui/button";
import { useState} from "react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSpecificTransaction,
} from "@/utils/trc20Actions";
import { sendMessage, createChannelInviteLink } from "@/utils/botActions";

// d3f4e8d3e097ca8b42ec54af420e8a4b448d02296ad8e81f08b509a1f96defdd

export default function PaymentForm(props: { paymentId: string | number }) {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const { toast } = useToast();
  const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN as string;
  const channelId = process.env.NEXT_PUBLIC_CHANNEL_ID as string;

  // Check if tgid is valid (not 'No ID Provided Yet')
  const isTgidValid = props.paymentId !== "No ID Provided Yet";

  // Show warning toast when invalid tgid tries to interact
  const handleInvalidTgid = () => {
    toast({
      title: "⚠️ TradeTutor ID Required",
      description: "Please start the bot first to get your TradeTutor ID",
      variant: "destructive",
    });
  };

  function isTimeframeExceeded(timestamp1: number, timestamp2: number, hours: number): boolean {
    const differenceInMs = Math.abs(timestamp2 - timestamp1);
    const differenceInHours = differenceInMs / (1000 * 60 * 60);
    return differenceInHours > hours;
  }

  // Function to request invite link from bot

  // Start monitoring transactions when payment method is selected
  // useEffect(() => {
  //   if (selectedPayment === "usdt_trc20" && !isMonitoring) {
  //     setIsMonitoring(true);
  //     const merchantAddress =
  //       process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS || "";

  //     const cleanup = monitorTRC20Transactions(
  //       merchantAddress,
  //       (transaction) => {
  //         // When a new transaction is detected, verify if it matches our expected amount
  //         if (transaction.value === "25000000") {
  //           // 25 USDT (6 decimals)
  //           toast({
  //             title: "✅ Payment Detected!",
  //             description: "Verifying your transaction...",
  //           });

  //           // Verify the transaction
  //           verifyUSDTTransaction(
  //             transaction.transaction_id,
  //             25,
  //             merchantAddress
  //           ).then((isValid) => {
  //             if (isValid) {
  //               toast({
  //                 title: "🎉 Payment Confirmed!",
  //                 description: "Generating your channel invite...",
  //               });
  //               // Request invite link from bot
  //               // requestInviteLink(props.paymentId);
  //             }
  //           });
  //         }
  //       },
  //       10000 // Check every 10 seconds
  //     );

  //     return () => {
  //       cleanup();
  //       setIsMonitoring(false);
  //     };
  //   }
  // }, [selectedPayment, toast, props.paymentId, isMonitoring]);

  // Handle manual transaction hash verification
  const handleVerifyTransaction = async (paymentId: string | number) => {
    if (!transactionHash) {
      toast({
        title: "⚠️ Error",
        description: "Please enter a transaction hash",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const merchantAddress =
        process.env.NEXT_PUBLIC_MERCHANT_TRON_ADDRESS || "";
      const isValid = await fetchSpecificTransaction(
        merchantAddress,
        transactionHash
      )
        .then((response) => {
          if (!response) return false;
          const isValidTx = response.transaction_id === transactionHash;
          const amountInUSDT = Number(response.amount) / 10 ** 6;
          const timeDifference = isTimeframeExceeded(response.timestamp || Date.now(), Date.now(), 100);
          return isValidTx && amountInUSDT >= 25 && !timeDifference;
        })
        .catch((error) => {
          console.error("Error details:", error);
          toast({
            title: "❌ Error",
            description:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
            variant: "destructive",
          });
        });
      console.log(isValid);
      if (isValid) {
        toast({
          title: "✅ Payment Verified!",
          description: "Generating your channel invite...",
        });
        // Request invite link from bot
        await createChannelInviteLink(botToken, channelId)
          .then((response) => {
            // console.log(response.result.invite_link);
            setInviteLink(response.result.invite_link);
            sendMessage(botToken, paymentId, response.result.invite_link);
            toast({
              title: "✅ Invite Link Sent!",
              description: "Invite link has been sent to your Telegram account",
            });
          })
          .catch((error) => {
            console.error("Error details:", error);
          });
      } else {
        toast({
          title: "❌ Verification Failed",
          description:
            "The transaction could not be verified. Please check the transaction hash and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
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
          !isTgidValid ? "text-red-400" : ""
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
            !isTgidValid ? "cursor-not-allowed opacity-50" : ""
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

      {selectedPayment === "usdt_trc20" && (
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
                  navigator.clipboard.writeText(
                    "TCRntw5B9QCUdmA6FcNZWKQPs621iH83ja"
                  );
                  toast({
                    title: "✔️ Copied to clipboard",
                  });
                }}
              >
                <span className="material-icons">content_copy</span>
              </button>
            </div>
            <p className="text-red-400 text-sm">
              *Make sure to select the{" "}
              <span className="text-orange-500">TRON(TRC20)</span> Network, if
              you are transferring from Bybit, Binance or any Crypto Exchange*
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-center text-gray-300">
              Your Valid Transaction Hash
            </p>
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
            ? "bg-teal-500 hover:bg-teal-600"
            : "bg-gray-500 cursor-not-allowed"
        } h-12 text-base flex items-center justify-center gap-2`}
        disabled={!selectedPayment || isVerifying}
        onClick={() => handleVerifyTransaction(props.paymentId)}
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
          <h3 className="text-xl font-semibold text-teal-400">
            🎉 Your VIP Channel Invite is Ready!
          </h3>
          <p className="text-sm text-gray-300">
            Click the button below to join our VIP channel. This link will
            expire in 1 hour.
          </p>
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 h-12 text-base flex items-center justify-center gap-2"
            onClick={() => window.open(inviteLink, "_blank")}
          >
            Join VIP Channel
            <span className="material-icons">telegram</span>
          </Button>
          <p className="text-xs text-gray-400">
            A copy of this invite link has also been sent to your Telegram
            account.
          </p>
        </div>
      )}
    </div>
  );
}
