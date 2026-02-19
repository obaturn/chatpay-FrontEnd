import { useState, useEffect } from 'react';
import { apiService } from '../components/api';

export interface Bank {
    name: string;
    code: string;
    slug: string;
    active: boolean;
}

export interface AccountDetails {
    accountName: string;
    accountNumber: string;
    bankId: number;
}

export function usePayment() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);
    const [isResolvingAccount, setIsResolvingAccount] = useState(false);
    const [resolvedAccount, setResolvedAccount] = useState<AccountDetails | null>(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch banks on mount
    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setIsLoadingBanks(true);
            const response = await apiService.getBanks();
            if (response.success && response.banks) {
                setBanks(response.banks);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch banks:', err);
            // Don't set global error for this, just log it. 
            // User can retry or we can show a specific message in the UI element.
        } finally {
            setIsLoadingBanks(false);
        }
    };

    const resolveAccount = async (accountNumber: string, bankCode: string) => {
        if (accountNumber.length !== 10) return; // Basic validation

        try {
            setIsResolvingAccount(true);
            setError(null);
            setResolvedAccount(null);

            const response = await apiService.resolveAccount(accountNumber, bankCode);

            if (response.success) {
                setResolvedAccount({
                    accountName: response.accountName,
                    accountNumber: response.accountNumber,
                    bankId: response.bankId
                });
            } else {
                setError('Could not verify account');
            }
        } catch (err: unknown) {
            console.error('Resolve account error:', err);
            setError(err instanceof Error ? err.message : 'Failed to verify account');
        } finally {
            setIsResolvingAccount(false);
        }
    };

    const withdraw = async (amount: number, accountNumber: string, bankCode: string, accountName: string, reason?: string) => {
        try {
            setIsWithdrawing(true);
            setError(null);

            const response = await apiService.withdraw(amount, accountNumber, bankCode, accountName, reason);

            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Withdrawal failed');
            }
        } catch (err: unknown) {
            console.error('Withdrawal error:', err);
            setError(err instanceof Error ? err.message : 'Withdrawal failed');
            throw err;
        } finally {
            setIsWithdrawing(false);
        }
    };

    return {
        banks,
        isLoadingBanks,
        resolveAccount,
        isResolvingAccount,
        resolvedAccount,
        withdraw,
        isWithdrawing,
        error,
        setError
    };
}
