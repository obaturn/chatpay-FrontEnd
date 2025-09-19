'use client';

import { useState } from 'react';

interface MarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentMethod: string, referenceId: string) => void;
}

export default function MarkAsPaidModal({ isOpen, onClose, onSubmit }: MarkAsPaidModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod && referenceId) {
      onSubmit(paymentMethod, referenceId);
      setPaymentMethod('');
      setReferenceId('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Mark as Paid</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
              Payment Method
            </label>
            <input
              type="text"
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="referenceId">
              Reference ID
            </label>
            <input
              type="text"
              id="referenceId"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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