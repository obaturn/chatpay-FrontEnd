'use client';

import { useState } from 'react';

interface PaymentRequestFormProps {
  onSubmit: (amount: number, receiverWallet: string) => void;
  onCancel: () => void;
}

export function PaymentRequestForm({ onSubmit, onCancel }: PaymentRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [receiverWallet, setReceiverWallet] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && receiverWallet) {
      onSubmit(parseFloat(amount), receiverWallet);
      setAmount('');
      setReceiverWallet('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Request Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Receiver Wallet Address
          </label>
          <input
            type="text"
            value={receiverWallet}
            onChange={(e) => setReceiverWallet(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Request Payment
          </button>
        </div>
      </form>
    </div>
  );
}

interface PaymentHistoryProps {
  payments: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    timestamp: string;
    type: 'sent' | 'received';
  }>;
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Payment History</h2>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payments yet</p>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">
                  {payment.type === 'sent' ? 'Sent' : 'Received'} ${payment.amount}
                </p>
                <p className="text-sm text-gray-500">{payment.timestamp}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                payment.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : payment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {payment.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface WalletConnectProps {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({ isConnected, address, onConnect, onDisconnect }: WalletConnectProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
      {isConnected ? (
        <div>
          <p className="text-green-600 mb-2">✅ Connected</p>
          <p className="text-sm text-gray-600 mb-4 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <button
            onClick={onDisconnect}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">Connect your wallet to send and receive payments</p>
          <button
            onClick={onConnect}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}