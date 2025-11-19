'use client';

import { useState, useEffect } from 'react';
import { useWallets, useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { paymentService } from './paymentService';

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'request' | 'paid' | 'send';
  onSubmit: (paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    receiverDetails: string;
  }) => void;
}

export default function PaymentDrawer({ isOpen, onClose, type, onSubmit }: PaymentDrawerProps) {
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();
  const signTransaction = useSignTransaction();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('sui');
  const [receiverDetails, setReceiverDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currencies = ['USD', 'EUR', 'NGN', 'SUI'];
  const paymentMethods = [
    { id: 'sui', name: 'Sui Wallet', icon: '🪙' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'card', name: 'Credit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when drawer closes
      setAmount('');
      setCurrency('USD');
      setPaymentMethod('sui');
      setReceiverDetails('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!amount || !receiverDetails) return;

    setIsProcessing(true);
    try {
      if (type === 'send' && paymentMethod === 'sui') {
        // Handle Sui blockchain payment
        await handleSuiPayment();
      } else {
        // Handle other payment methods
        onSubmit({
          amount: parseFloat(amount),
          currency,
          paymentMethod,
          receiverDetails,
        });
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuiPayment = async () => {
    if (!currentAccount || !signTransaction) {
      alert('Please connect your Sui wallet first');
      return;
    }

    try {
      // Create payment request on blockchain
      const result = await paymentService.createPaymentRequest(
        parseFloat(amount),
        currency,
        receiverDetails,
        `Payment from ${currentAccount.address}`,
        '', // chatId - can be added later
        '', // messageId - can be added later
        '', // bankDetails - empty for crypto
        signTransaction // Pass the signTransaction hook
      );

      if (result.success) {
        console.log('Payment request created:', result.transactionId);
        onSubmit({
          amount: parseFloat(amount),
          currency,
          paymentMethod: 'sui',
          receiverDetails,
        });
      } else {
        throw new Error(result.error || 'Payment request failed');
      }
    } catch (error) {
      console.error('Sui payment failed:', error);
      throw error;
    }
  };

  const getDrawerTitle = () => {
    switch (type) {
      case 'request':
        return 'Request Payment';
      case 'send':
        return 'Send Payment';
      case 'paid':
        return 'Mark as Paid';
      default:
        return 'Payment';
    }
  };

  const getSubmitButtonText = () => {
    if (isProcessing) return 'Processing...';
    switch (type) {
      case 'request':
        return 'Send Request';
      case 'send':
        return 'Send Payment';
      case 'paid':
        return 'Mark as Paid';
      default:
        return 'Submit';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent overlay for drawer area only */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {getDrawerTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isProcessing}
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 border rounded-lg text-left transition duration-200 ${
                    paymentMethod === method.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-2">
                    <span>{method.icon}</span>
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Receiver Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'send' ? 'Recipient' : 'Payment Details'}
            </label>
            <input
              type="text"
              value={receiverDetails}
              onChange={(e) => setReceiverDetails(e.target.value)}
              placeholder={
                paymentMethod === 'sui'
                  ? 'Enter Sui wallet address'
                  : type === 'send'
                  ? 'Enter recipient details'
                  : 'Enter payment reference'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Wallet Connection Status */}
          {paymentMethod === 'sui' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🔗</span>
                <span className="text-sm text-blue-700">
                  {currentAccount
                    ? `Connected: ${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
                    : 'Please connect your Sui wallet'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount || !receiverDetails || isProcessing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition duration-200 disabled:cursor-not-allowed"
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}