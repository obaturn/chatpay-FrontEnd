// Payment Service for handling multi-currency payments
// Integrates with Sui blockchain and fiat payment providers

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import type { Signer } from '@mysten/sui/cryptography';

// Type for the signer from @mysten/dapp-kit's useSignTransaction hook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletSigner = any;

interface PaymentRequest {
  id: string;
  amount: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'SUI';
  recipient: string;
  description?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  private suiClient: SuiClient;
  private packageId: string;
  private chatPayObjectId: string;

  constructor() {
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'),
    });
    this.packageId = process.env.NEXT_PUBLIC_CHATPAY_PACKAGE_ID || '';
    this.chatPayObjectId = process.env.NEXT_PUBLIC_CHATPAY_OBJECT_ID || '';
  }

  // Create payment request on blockchain
  async createPaymentRequest(
    amount: number,
    currency: string,
    receiverAddress: string,
    description: string = '',
    chatId: string = '',
    messageId: string = '',
    bankDetails: string = '',
    signer: WalletSigner // Wallet signer from dApp kit
  ): Promise<PaymentResponse> {
    try {
      if (!this.packageId || !this.chatPayObjectId) {
        throw new Error('Smart contract configuration missing');
      }

      const tx = new Transaction();

      // Convert amount to blockchain units
      const amountInUnits = this.convertToBlockchainUnits(amount, currency);

      tx.moveCall({
        target: `${this.packageId}::blockchainpayment::create_payment_request`,
        arguments: [
          tx.object(this.chatPayObjectId),
          tx.pure.address(receiverAddress),
          tx.pure.u64(amountInUnits),
          tx.pure.string(currency),
          tx.pure.string('crypto'), // payment_method
          tx.pure.string(description),
          tx.pure.string(chatId),
          tx.pure.string(messageId),
          tx.pure.string(bankDetails),
        ],
      });

      const result = await signer.mutateAsync({
        transaction: tx,
      });

      console.log('Payment request created:', result);

      return {
        success: true,
        transactionId: result.digest,
      };
    } catch (error) {
      console.error('Create payment request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment request',
      };
    }
  }

  // Complete crypto payment
  async completeCryptoPayment(
    paymentId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signer: any // Wallet signer from dApp kit
  ): Promise<PaymentResponse> {
    try {
      if (!this.packageId || !this.chatPayObjectId) {
        throw new Error('Smart contract configuration missing');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${this.packageId}::blockchainpayment::complete_crypto_payment`,
        arguments: [
          tx.object(this.chatPayObjectId),
          tx.pure.id(paymentId),
        ],
      });

      const result = await signer.mutateAsync({
        transaction: tx,
      });

      console.log('Payment completed:', result);

      return {
        success: true,
        transactionId: result.digest,
      };
    } catch (error) {
      console.error('Complete payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete payment',
      };
    }
  }

  // Send SUI payment (legacy method - now uses createPaymentRequest + completeCryptoPayment)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendSUIPayment(request: PaymentRequest, signer?: any): Promise<PaymentResponse> {
    try {
      if (!signer) {
        // Mock implementation for backward compatibility
        console.log('Sending SUI payment (mock):', request);
        return {
          success: true,
          transactionId: `sui_tx_${Date.now()}`,
        };
      }

      // Create payment request first
      const createResult = await this.createPaymentRequest(
        request.amount,
        request.currency,
        request.recipient,
        request.description || '',
        '', // chatId
        '', // messageId
        '', // bankDetails
        signer
      );

      if (!createResult.success) {
        return createResult;
      }

      // For immediate payments, we might need to complete it
      // But typically, the receiver would complete it
      return createResult;
    } catch (error) {
      console.error('SUI payment failed:', error);
      return {
        success: false,
        error: 'SUI payment failed',
      };
    }
  }

  // Request payment (off-chain)
  async requestPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Creating payment request:', request);

      // In a real implementation, this would:
      // 1. Store payment request in database
      // 2. Send notification to recipient
      // 3. Generate payment link

      return {
        success: true,
        transactionId: `req_${Date.now()}`,
      };
    } catch (error) {
      console.error('Payment request failed:', error);
      return {
        success: false,
        error: 'Payment request failed',
      };
    }
  }

  // Handle fiat payments (bank transfer, card, etc.)
  async processFiatPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Processing fiat payment:', request);

      // In a real implementation, this would integrate with:
      // - Stripe for card payments
      // - PayPal for PayPal payments
      // - Bank APIs for bank transfers

      // Mock successful payment
      return {
        success: true,
        transactionId: `fiat_tx_${Date.now()}`,
      };
    } catch (error) {
      console.error('Fiat payment failed:', error);
      return {
        success: false,
        error: 'Fiat payment failed',
      };
    }
  }

  // Verify payment status
  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      // In a real implementation, check transaction status
      // For Sui: query the blockchain
      // For fiat: check with payment provider

      console.log('Verifying payment:', transactionId);
      return true; // Mock verification
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  // Get exchange rates (for currency conversion)
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      // In a real implementation, fetch from a currency API
      return {
        USD: 1,
        EUR: 0.85,
        NGN: 750,
        SUI: 1, // SUI is the base
      };
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return {};
    }
  }

  // Convert amount to blockchain units based on currency
  private convertToBlockchainUnits(amount: number, currency: string): number {
    const decimals: Record<string, number> = {
      SUI: 9,
      USDC: 6,
      NGN: 2,
      USD: 2,
      EUR: 2,
    };

    const decimalPlaces = decimals[currency] || 0;
    return Math.floor(amount * Math.pow(10, decimalPlaces));
  }

  // Convert currency
  convertCurrency(amount: number, from: string, to: string): number {
    // Simplified conversion - in real app, use current rates
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      NGN: 750,
      SUI: 1,
    };

    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    return (amount / fromRate) * toRate;
  }
}

export const paymentService = new PaymentService();