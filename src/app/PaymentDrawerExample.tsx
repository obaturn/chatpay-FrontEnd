/**
 * PaymentDrawer Component - Send Payment UI
 * Example of how to use the payment service
 */

'use client';

import { useState } from 'react';
import {paymentService} from './paymentService';

interface PaymentDrawerProps {
  recipientId: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDrawer({
  recipientId,
  recipientName,
  isOpen,
  onClose
}: PaymentDrawerProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSendPayment = async () => {
    try {
      setError('');
      setLoading(true);

      if (amount < 100) {
        setError('Minimum amount is ₦100');
        return;
      }

      // Initialize payment
      const result = await paymentService.initializePayment(
        recipientId,
        amount,
        description || `Payment to ${recipientName}`
      );

      if (!result.success) {
        setError(result.message || 'Failed to initialize payment');
        return;
      }

      const { transactionId, authorizationUrl } = result;
      if (!transactionId || !authorizationUrl) {
        setError('Invalid payment response from server');
        return;
      }

      // Store transaction ID for later verification
      sessionStorage.setItem('pendingTransactionId', transactionId);

      // Redirect to Paystack
      window.location.href = authorizationUrl;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-lg p-6 max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Send Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Recipient Info */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Sending to</p>
          <p className="text-lg font-semibold">{recipientName}</p>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (NGN)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum: ₦100</p>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this for?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Amount Summary */}
        {amount > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">₦{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Fee (1.5%):</span>
              <span className="font-semibold">₦{Math.round(amount * 0.015).toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="font-bold text-lg">
                ₦{Math.round(amount * 1.015).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendPayment}
            disabled={loading || amount < 100}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Send'}
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You&apos;ll be redirected to Paystack to complete the payment securely
        </p>
      </div>
    </div>
  );
}
