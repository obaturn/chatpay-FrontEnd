// Payment Service for handling multi-currency payments
// Integrates with Sui blockchain and fiat payment providers

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

interface PaymentRequest {
  id: string;
  amount: number;
  currency: 'NGN' | 'SUI' | 'USDC';
  paymentMethod: 'bank' | 'crypto';
  receiverDetails: string;
  description?: string;
  chatId?: string;
  messageId?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  transactionHash?: string;
  error?: string;
}

interface FiatPaymentProvider {
  name: string;
  supportedCurrencies: string[];
  apiKey: string;
  baseUrl: string;
}

class PaymentService {
  private suiClient: SuiClient;
  private fiatProviders: FiatPaymentProvider[] = [
    {
      name: 'Flutterwave',
      supportedCurrencies: ['NGN'],
      apiKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY || '',
      baseUrl: 'https://api.flutterwave.com/v3'
    },
    {
      name: 'Paystack',
      supportedCurrencies: ['NGN'],
      apiKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '',
      baseUrl: 'https://api.paystack.co'
    }
  ];

  constructor() {
    // Initialize real Sui client
    this.suiClient = new SuiClient({
      url: getFullnodeUrl('testnet')
    });
  }

  // ===== CRYPTO PAYMENT METHODS =====

  async createCryptoPaymentRequest(request: PaymentRequest, signTransaction?: any): Promise<PaymentResponse> {
    try {
      const packageId = process.env.NEXT_PUBLIC_CHATPAY_PACKAGE_ID || '0x11b40daaa0068aa9bfa1ea493757cbb12fe6c25bc2094e287f25a3cd828e67d0';
      const chatPayObjectId = process.env.NEXT_PUBLIC_CHATPAY_OBJECT_ID || '0x6fb7883a8451f6054b7182396e7de8a4913bc09b5fbdcd279b2c0c7050a303f2';

      // Convert amount to smallest unit
      const amountInSmallestUnit = Math.floor(request.amount * Math.pow(10, this.getCurrencyDecimals(request.currency)));

      // Build transaction using Transaction
      const txb = new Transaction();
      txb.moveCall({
        target: `${packageId}::blockchainpayment::create_payment_request`,
        arguments: [
          txb.object(chatPayObjectId), // ChatPay object
          txb.pure.string(request.receiverDetails), // receiver address
          txb.pure.string(amountInSmallestUnit.toString()), // amount in smallest unit
          txb.pure.string(request.currency), // currency string
          txb.pure.string(request.paymentMethod), // payment method
          txb.pure.string(request.description || ''), // description
          txb.pure.string(request.chatId || ''), // chat ID
          txb.pure.string(request.messageId || ''), // message ID
          txb.pure.string(''), // bank details (empty for crypto)
        ],
      });

      if (!signTransaction) {
        throw new Error('Wallet not connected. Please connect your Sui wallet first.');
      }

      // Sign and execute transaction using dapp-kit
      const result = await signTransaction({
        transaction: txb,
      });

      return {
        success: true,
        paymentId: `payment_${Date.now()}`,
        transactionHash: result.digest
      };

    } catch (error) {
      console.error('Crypto payment request failed:', error);
      return {
        success: false,
        error: `Failed to create crypto payment request: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async completeCryptoPayment(paymentId: string, signTransaction?: any): Promise<PaymentResponse> {
    try {
      const packageId = process.env.NEXT_PUBLIC_CHATPAY_PACKAGE_ID || '0x11b40daaa0068aa9bfa1ea493757cbb12fe6c25bc2094e287f25a3cd828e67d0';
      const chatPayObjectId = process.env.NEXT_PUBLIC_CHATPAY_OBJECT_ID || '0x6fb7883a8451f6054b7182396e7de8a4913bc09b5fbdcd279b2c0c7050a303f2';

      // Build transaction using Transaction
      const txb = new Transaction();
      txb.moveCall({
        target: `${packageId}::blockchainpayment::complete_crypto_payment`,
        arguments: [
          txb.object(chatPayObjectId), // ChatPay object
          txb.pure.string(paymentId), // payment ID
          // payment coin would be passed here - need to get the coin object
        ],
      });

      if (!signTransaction) {
        throw new Error('Wallet not connected. Please connect your Sui wallet first.');
      }

      // Sign and execute transaction using dapp-kit
      const result = await signTransaction({
        transaction: txb,
      });

      return {
        success: true,
        transactionHash: result.digest
      };

    } catch (error) {
      console.error('Crypto payment completion failed:', error);
      return {
        success: false,
        error: `Failed to complete crypto payment: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // ===== FIAT PAYMENT METHODS =====

  async createFiatPaymentRequest(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Use Flutterwave as primary provider
      const provider = this.fiatProviders.find(p => p.name === 'Flutterwave');
      if (!provider) {
        throw new Error('No fiat payment provider available');
      }

      const response = await fetch(`${provider.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: `chatpay_${Date.now()}`,
          amount: request.amount.toString(),
          currency: request.currency,
          redirect_url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/payment/callback`,
          customer: {
            email: request.receiverDetails || 'customer@example.com', // Use receiver details as email if available
            name: 'Customer Name',
          },
          customizations: {
            title: 'ChatPay Payment',
            description: request.description || 'Payment request from chat',
          },
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          paymentId: data.data.id,
          transactionHash: data.data.tx_ref
        };
      } else {
        throw new Error(data.message);
      }

    } catch (error) {
      console.error('Fiat payment request failed:', error);
      return {
        success: false,
        error: 'Failed to create fiat payment request'
      };
    }
  }

  async verifyFiatPayment(paymentId: string, providerName: string = 'Flutterwave'): Promise<PaymentResponse> {
    try {
      const provider = this.fiatProviders.find(p => p.name === providerName);
      if (!provider) {
        throw new Error('Payment provider not found');
      }

      const response = await fetch(`${provider.baseUrl}/transactions/${paymentId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
        },
      });

      const data = await response.json();

      if (data.status === 'success' && data.data.status === 'successful') {
        return {
          success: true,
          transactionHash: data.data.tx_ref
        };
      } else {
        return {
          success: false,
          error: 'Payment verification failed'
        };
      }

    } catch (error) {
      console.error('Fiat payment verification failed:', error);
      return {
        success: false,
        error: 'Failed to verify fiat payment'
      };
    }
  }

  // ===== UTILITY METHODS =====

  private getCurrencyDecimals(currency: string): number {
    const decimals: { [key: string]: number } = {
      'SUI': 9,
      'USDC': 6,
      'NGN': 2,
    };
    return decimals[currency] || 2;
  }

  getSupportedCurrencies(): string[] {
    return ['NGN', 'SUI', 'USDC'];
  }

  getPaymentMethods(): { value: string; label: string; type: 'fiat' | 'crypto' }[] {
    return [
      { value: 'bank', label: 'Bank Transfer', type: 'fiat' },
      { value: 'crypto', label: 'Cryptocurrency', type: 'crypto' },
    ];
  }

  isCryptoCurrency(currency: string): boolean {
    return ['SUI', 'USDC'].includes(currency);
  }

  // ===== WALLET INTEGRATION =====

  async connectWallet(): Promise<{ address: string } | null> {
    try {
      // Note: This should be replaced with proper Sui wallet integration
      // For now, using mock connection - in production, use @mysten/dapp-kit or wallet adapters
      if (typeof window !== 'undefined') {
        // Mock Sui wallet connection
        console.warn('Using mock Sui wallet connection. Replace with real Sui wallet integration.');
        return { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' };
      }
      return null;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return null;
    }
  }

  async getWalletBalance(address: string, currency: string): Promise<number> {
    try {
      if (currency === 'SUI') {
        // Get SUI balance from Sui network
        const balance = await this.suiClient.getBalance({ owner: address });
        return Number(balance.totalBalance) / Math.pow(10, 9); // Convert from MIST to SUI
      } else if (currency === 'USDC') {
        // Get USDC balance - would need to query the USDC coin type
        // For now, mock
        return 500;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return 0;
    }
  }

  // ===== PAYMENT HISTORY =====

  async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      // This would fetch from your backend API
      // const response = await fetch(`/api/payments/history?userId=${userId}`);
      // return await response.json();

      // Mock data
      return [
        {
          id: '1',
          amount: 50000,
          currency: 'NGN',
          type: 'received',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Payment for design work'
        },
        {
          id: '2',
          amount: 10,
          currency: 'SUI',
          type: 'sent',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Coffee payment'
        }
      ];
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return [];
    }
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const paymentService = new PaymentService();