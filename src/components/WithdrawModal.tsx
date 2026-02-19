import { useState, useEffect } from 'react';
import { usePayment } from '../hooks/usePayment';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
    const {
        banks,
        isLoadingBanks,
        resolveAccount,
        isResolvingAccount,
        resolvedAccount,
        withdraw,
        isWithdrawing,
        error,
        setError
    } = usePayment();

    const [selectedBankCode, setSelectedBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (!isOpen) {
            setSelectedBankCode('');
            setAccountNumber('');
            setAmount('');
            setReason('');
            setStep(1);
            setError(null);
        }
    }, [isOpen, setError]);

    useEffect(() => {
        if (accountNumber.length === 10 && selectedBankCode) {
            resolveAccount(accountNumber, selectedBankCode);
        }
    }, [accountNumber, selectedBankCode, resolveAccount]);

    const handleNext = () => {
        if (!amount || !selectedBankCode || !resolvedAccount) return;
        setStep(2);
    };

    const handleWithdraw = async () => {
        if (!amount || !selectedBankCode || !accountNumber) return;

        try {
            await withdraw(
                parseFloat(amount),
                accountNumber,
                selectedBankCode,
                reason
            );
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Withdrawal failed:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                    <div className="p-6 pb-0">
                        <div className="flex items-center mb-4">
                            <span className="text-2xl mr-2">🏦</span>
                            <h3 className="text-lg font-medium text-gray-900">
                                Withdraw to Bank
                            </h3>
                        </div>

                        {error && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="mt-4">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Bank</label>
                                        <select
                                            value={selectedBankCode}
                                            onChange={(e) => setSelectedBankCode(e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                            disabled={isLoadingBanks}
                                        >
                                            <option value="">Select a bank</option>
                                            {banks.map((bank) => (
                                                <option key={bank.code} value={bank.code}>
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                        <input
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            maxLength={10}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                            placeholder="Enter account number"
                                        />
                                    </div>

                                    {isResolvingAccount && (
                                        <p className="text-sm text-gray-500">Verifying account...</p>
                                    )}

                                    {resolvedAccount && (
                                        <div className="p-3 bg-green-50 rounded-md">
                                            <p className="text-sm font-medium text-green-800">{resolvedAccount.accountName}</p>
                                            <p className="text-xs text-green-600">{resolvedAccount.bankId}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Amount (₦)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                            placeholder="Enter amount"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
                                        <input
                                            type="text"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                            placeholder="What's this for?"
                                        />
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={!amount || !selectedBankCode || !resolvedAccount}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="font-medium text-gray-900">Confirm Withdrawal</h4>
                                        <div className="mt-2 space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Amount:</span> ₦{parseFloat(amount).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">To:</span> {resolvedAccount?.accountName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Bank:</span> {resolvedAccount?.bankId}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Account:</span> {accountNumber}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isWithdrawing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                    >
                                        {isWithdrawing ? 'Processing...' : `Withdraw ₦${parseFloat(amount).toLocaleString()}`}
                                    </button>

                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    >
                                        Back
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isWithdrawing}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
