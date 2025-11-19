'use client';

import { useState } from 'react';

interface Payment {
  id: string;
  type: 'request' | 'manual';
  amount?: number;
  receiverWallet?: string;
  paymentMethod?: string;
  referenceId?: string;
  status: 'verified' | 'unverified' | null;
  txHash?: string;
}

interface MessageProps {
  id: string;
  text: string;
  payment?: Payment;
  timestamp: string;
}

export default function Message({ id, text, payment, timestamp }: MessageProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePaymentClick = () => {
    if (payment?.status === 'verified' && payment.txHash) {
      window.open(`https://explorer.sui.io/txblock/${payment.txHash}`, '_blank');
    }
  };

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unverified':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: string | null) => {
    switch (status) {
      case 'verified':
        return 'Verified Payment';
      case 'unverified':
        return 'Pending Verification';
      default:
        return 'Payment';
    }
  };

  return (
    <div className="flex items-start space-x-3 mb-4">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">U</span>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
          {/* Message Text */}
          <p className="text-gray-900 text-sm leading-relaxed break-words">
            {text}
          </p>

          {/* Payment Info */}
          {payment && (
            <div
              className={`mt-3 p-3 rounded-lg border cursor-pointer transition duration-200 ${
                payment.status === 'verified' ? 'hover:bg-green-50' : ''
              } ${getPaymentStatusColor(payment.status)}`}
              onClick={handlePaymentClick}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-sm font-medium">
                      {payment.type === 'request' ? 'Payment Request' : 'Payment Sent'}
                    </p>
                    {payment.amount && (
                      <p className="text-xs opacity-75">
                        ${payment.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPaymentStatusColor(payment.status)}`}>
                    {getPaymentStatusText(payment.status)}
                  </span>
                  {payment.status === 'verified' && (
                    <div className="mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {payment.receiverWallet && (
                <p className="text-xs opacity-75 mt-2 break-all">
                  To: {payment.receiverWallet}
                </p>
              )}

              {payment.txHash && (
                <p className="text-xs opacity-75 mt-1 break-all">
                  TX: {payment.txHash.slice(0, 10)}...{payment.txHash.slice(-8)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-1 px-1">
          {timestamp}
        </p>

        {/* Tooltip */}
        {showTooltip && payment?.status === 'verified' && payment.txHash && (
          <div className="absolute z-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg mt-1">
            Click to view on blockchain explorer
          </div>
        )}
      </div>
    </div>
  );
}