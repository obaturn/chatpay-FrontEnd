'use client';

import { useState } from 'react';

interface RequestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, receiverWallet: string) => void;
}

export default function RequestPaymentModal({ isOpen, onClose, onSubmit }: RequestPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [receiverWallet, setReceiverWallet] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && receiverWallet) {
      onSubmit(parseFloat(amount), receiverWallet);
      setAmount('');
      setReceiverWallet('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Request Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receiverWallet">
              Receiver Wallet
            </label>
            <input
              type="text"
              id="receiverWallet"
              value={receiverWallet}
              onChange={(e) => setReceiverWallet(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}