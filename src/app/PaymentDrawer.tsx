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
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [amount, setAmount] = useState('');
  const [receiverWallet, setReceiverWallet] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'SUI' | 'USDC'>('NGN');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto'>('bank');

  // Update currency when payment method changes
  const handlePaymentMethodChange = (method: 'bank' | 'crypto') => {
    setPaymentMethod(method);
    if (method === 'crypto') {
      setCurrency('SUI'); // Default to SUI for crypto
    } else {
      setCurrency('NGN'); // Default to NGN for bank
    }
  };
  const [loading, setLoading] = useState(false);

  const title = type === 'request' ? 'Receive Payment' : type === 'send' ? 'Send Payment' : 'Mark as Paid';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount) {
      setLoading(true);
      try {
        const paymentData = {
          amount: parseFloat(amount),
          currency: paymentMethod === 'crypto' ? currency : 'NGN',
          paymentMethod,
          receiverDetails: receiverWallet || 'Bank transfer details collected'
        };

        console.log('📋 Payment Data:', paymentData);
        console.log('💰 Payment Method:', paymentMethod);
        console.log('🪙 Selected Currency:', currency);
        console.log('👛 Receiver Wallet:', receiverWallet);

        // Create payment through the service
        let result: { success: boolean; paymentId?: string; transactionHash?: string; error?: string } | undefined;
        if (paymentMethod === 'crypto') {
          if (!currentAccount) {
            alert('Please connect your Sui wallet first');
            return;
          }

          // Convert amount to smallest unit (needed for both send and receive)
          const decimals = currency === 'SUI' ? 9 : currency === 'USDC' ? 6 : 2;
          const amountInSmallestUnit = Math.floor(parseFloat(amount) * Math.pow(10, decimals));

          // Validate amount against contract limits
          const minAmounts = { SUI: 1000000, USDC: 1000000, NGN: 10000 };
          const maxAmounts = { SUI: 1000000000000, USDC: 1000000000000, NGN: 1000000000 };

          console.log(`Converted amount: ${amountInSmallestUnit} (${currency} in smallest units)`);

          if (amountInSmallestUnit < minAmounts[currency as keyof typeof minAmounts]) {
            alert(`Amount too small. Minimum for ${currency} is ${(minAmounts[currency as keyof typeof minAmounts] / Math.pow(10, decimals)).toFixed(decimals === 9 ? 3 : decimals === 6 ? 2 : 0)} ${currency}`);
            return;
          }
          if (amountInSmallestUnit > maxAmounts[currency as keyof typeof maxAmounts]) {
            alert(`Warning: Amount is large. Maximum recommended for ${currency} is ${(maxAmounts[currency as keyof typeof maxAmounts] / Math.pow(10, decimals)).toFixed(decimals === 9 ? 3 : decimals === 6 ? 2 : 0)} ${currency}. Transaction may still proceed but could fail.`);
            // Don't return, allow the transaction to proceed
          }

          if (type === 'send') {
            // For sending crypto payment
            if (currency === 'USDC') {
              alert('Sending USDC is not yet implemented. Use SUI for now.');
              return;
            }

            const txb = new Transaction();
            txb.setSender(currentAccount.address);
            txb.setGasBudget(100000000); // 0.1 SUI gas budget

            // Split the amount from gas coin and transfer
            const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInSmallestUnit)]);
            txb.transferObjects([coin], txb.pure.address(receiverWallet));

            console.log('Sending transaction...');

            try {
              const txResult = await signTransaction({ transaction: txb });
              console.log('🎉 Send transaction successful:', txResult);
              result = {
                success: true,
                paymentId: (txResult as any).digest || `send_${Date.now()}`,
                transactionHash: (txResult as any).digest
              };
            } catch (error: any) {
              console.log('❌ Send transaction failed:', error);
              result = {
                success: false,
                error: `Send failed: ${error.message || String(error)}`
              };
            }
          } else {
            // For receiving payment - create payment request on blockchain
            const packageId = process.env.NEXT_PUBLIC_CHATPAY_PACKAGE_ID || '0xcf86d7db1cb98dbbfe169c470ab2d120688860b6daf6023de5e724b279aa46a6';
            const chatPayObjectId = process.env.NEXT_PUBLIC_CHATPAY_OBJECT_ID || '0x7546734271f7a10d5c40be476f4121ef71fc0b4309095da9180788e6f8d982e9';

            const txb = new Transaction();
            txb.setSender(currentAccount.address);
            txb.setGasBudget(100000000); // 0.1 SUI gas budget for larger transactions

            txb.moveCall({
              target: `${packageId}::blockchainpayment::create_payment_request`,
              arguments: [
                txb.object(chatPayObjectId),
                txb.pure.address(receiverWallet),
                txb.pure.u64(amountInSmallestUnit),
                txb.pure.string(currency),
                txb.pure.string('crypto'),
                txb.pure.string(`Payment request for ${amount} ${currency}`),
                txb.pure.string(''),
                txb.pure.string(''),
                txb.pure.string(''),
              ],
            });

            console.log('Submitting transaction directly...');

            // Use signTransaction with promise
            try {
              const txResult = await signTransaction({ transaction: txb });
              console.log('🎉 Transaction successful:', txResult);
              result = {
                success: true,
                paymentId: (txResult as any).digest || `payment_${Date.now()}`,
                transactionHash: (txResult as any).digest
              };
            } catch (error: any) {
              console.log('❌ Transaction failed:', error);
              result = {
                success: false,
                error: `Transaction failed: ${error.message || String(error)}`
              };
            }
          }
        } else {
          // For fiat payments, just return success for now
          // In a real implementation, this would integrate with payment providers
          result = {
            success: true,
            paymentId: `fiat_${Date.now()}`,
            transactionHash: `fiat_tx_${Date.now()}`
          };
        }

        if (result && result.success) {
          onSubmit(paymentData);
          handleClose();
        } else {
          alert(`Payment request failed: ${result?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Payment submission error:', error);
        alert('Failed to submit payment request. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setAmount('');
    setReceiverWallet('');
    setPaymentMethod('bank');
    setCurrency('NGN'); // This will be auto-set by handlePaymentMethodChange, but we set it explicitly for clarity
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dim overlay - only over chat area */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('bank')}
                  className={`p-3 border rounded-lg text-center transition duration-200 ${
                    paymentMethod === 'bank'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🏦</div>
                  <div className="text-sm font-medium">Bank Transfer</div>
                  <div className="text-xs text-gray-500">NGN</div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('crypto')}
                  className={`p-3 border rounded-lg text-center transition duration-200 ${
                    paymentMethod === 'crypto'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">₿</div>
                  <div className="text-sm font-medium">Cryptocurrency</div>
                  <div className="text-xs text-gray-500">SUI/USDC</div>
                </button>
              </div>
            </div>

            {/* Currency Selection for Crypto */}
            {paymentMethod === 'crypto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'NGN' | 'SUI' | 'USDC')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="SUI">SUI Token</option>
                  <option value="USDC">USDC Stablecoin</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({paymentMethod === 'crypto' ? currency : 'NGN'})
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="receiverWallet" className="block text-sm font-medium text-gray-700 mb-2">
                {paymentMethod === 'crypto'
                  ? (type === 'send' ? 'Recipient Wallet Address' : 'Your Wallet Address')
                  : 'Bank Account Details'
                }
              </label>
              {paymentMethod === 'crypto' ? (
                <input
                  type="text"
                  id="receiverWallet"
                  value={receiverWallet}
                  onChange={(e) => setReceiverWallet(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0x..."
                  required
                />
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Account Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            {type === 'paid' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Payment Reference</span>
                </div>
                <p className="text-sm text-blue-700">
                  Enter the reference ID from your payment method to mark this transaction as completed.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' :
                  type === 'send' ? 'Send Payment' :
                  type === 'request' ? 'Create Receivable' : 'Mark as Paid'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}