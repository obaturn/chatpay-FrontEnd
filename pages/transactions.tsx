import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../src/components/AuthContext';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'request';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  description: string;
  recipient?: string;
  sender?: string;
  timestamp: string;
  txHash?: string;
}

export default function TransactionsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadTransactions();
  }, [isAuthenticated]);

  const loadTransactions = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/payments/history');
      // const data = await response.json();

      // Mock data for now
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'sent',
          amount: 1.5,
          currency: 'SUI',
          status: 'completed',
          description: 'Payment for coffee',
          recipient: 'Alice Johnson',
          timestamp: '2024-01-15T10:30:00Z',
          txHash: '0x1234567890abcdef'
        },
        {
          id: '2',
          type: 'received',
          amount: 50,
          currency: 'USD',
          status: 'pending',
          description: 'Freelance work payment',
          sender: 'Bob Smith',
          timestamp: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          type: 'request',
          amount: 25,
          currency: 'EUR',
          status: 'completed',
          description: 'Dinner split',
          sender: 'Charlie Brown',
          timestamp: '2024-01-13T20:15:00Z',
          txHash: '0xabcdef1234567890'
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'sent') return transaction.type === 'sent';
    if (filter === 'received') return transaction.type === 'received';
    if (filter === 'pending') return transaction.status === 'pending';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return '📤';
      case 'received':
        return '📥';
      case 'request':
        return '💰';
      default:
        return '💳';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      NGN: '₦',
      SUI: 'SUI '
    };

    const symbol = symbols[currency] || currency + ' ';
    return symbol + amount.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-1">View all your payment transactions</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                filter === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                filter === 'sent'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                filter === 'received'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Received
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                filter === 'pending'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {transaction.description}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {transaction.type === 'sent' && transaction.recipient && `To: ${transaction.recipient}`}
                          {transaction.type === 'received' && transaction.sender && `From: ${transaction.sender}`}
                          {transaction.type === 'request' && transaction.sender && `Requested by: ${transaction.sender}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 mb-2">
                        {transaction.type === 'received' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                      {transaction.txHash && (
                        <div className="mt-2">
                          <button
                            onClick={() => window.open(`https://suiexplorer.com/txblock/${transaction.txHash}`, '_blank')}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View on Explorer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}