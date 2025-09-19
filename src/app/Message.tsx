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

  return (
    <div className="flex justify-end mb-2">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg max-w-xs shadow-md relative">
        <p className="mb-1">{text}</p>
        {payment && (
          <div className="flex items-center space-x-2 mb-1">
            {payment.status === 'verified' && (
              <span className="text-green-200 text-sm">✅</span>
            )}
            {payment.status === 'unverified' && (
              <span className="text-yellow-200 text-sm">⚠️</span>
            )}
            {payment.txHash && (
              <div className="relative">
                <span
                  className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded cursor-pointer"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  TX
                </span>
                {showTooltip && (
                  <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-1">
                    {payment.txHash}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end items-center space-x-1">
          <span className="text-green-200 text-xs">{timestamp}</span>
          <span className="text-green-200 text-xs">✓✓</span>
        </div>
      </div>
    </div>
  );
}