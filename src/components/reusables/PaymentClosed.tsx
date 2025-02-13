import { getPaymentWindowStatus } from "@/utils/payment-window";

const PaymentClosed = () => {
  const { opensOn, closesOn, daysUntilOpen } = getPaymentWindowStatus();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start pt-20 px-4 md:px-8 lg:px-16">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Payment Portal Closed</h1>
          </div>

          {/* Payment Window Info */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">Payment Window</span>
              <span className="text-gray-500">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Opens</div>
                  <div className="font-semibold">{opensOn}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Closes</div>
                  <div className="font-semibold">{closesOn}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <p className="text-gray-700">
                Please return between <span className="text-blue-600 font-medium">{opensOn}</span> and{" "}
                <span className="text-red-600 font-medium">{closesOn}</span> to make your payment.
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-3">
            <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="text-blue-700 font-medium">
                Payment portal opens in {daysUntilOpen} days
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((30 - daysUntilOpen) / 30) * 100))}%` 
                }}
              />
            </div>
            <div className="text-sm text-gray-500 text-center">
              Progress until next payment window
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentClosed; 