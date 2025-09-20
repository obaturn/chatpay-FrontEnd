# 🚀 ChatPay Sui Integration Setup Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Sui CLI** installed
3. **Sui Wallet** browser extension
4. **Test SUI** from [Sui Faucet](https://faucet.testnet.sui.io/)

## 🛠️ Step-by-Step Setup

### 1. Install Dependencies

```bash
cd chatpayment
npm install
```

This will install:
- ✅ `@mysten/sui.js` - Sui blockchain integration
- ✅ `@mysten/wallet-adapter-sui` - Wallet connection
- ✅ React wallet components

### 2. Configure Sui Testnet

```bash
# Switch to testnet
sui client switch --env testnet

# Check current environment
sui client envs

# Get test SUI
sui client faucet
```

### 3. Environment Setup

Your `.env.local` is already configured with:
```env
NEXT_PUBLIC_CHATPAY_PACKAGE_ID=0xcf86d7db1cb98dbbfe169c470ab2d120688860b6daf6023de5e724b279aa46a6
NEXT_PUBLIC_CHATPAY_OBJECT_ID=0x7546734271f7a10d5c40be476f4121ef71fc0b4309095da9180788e6f8d982e9
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

### 4. Install Sui Wallet

1. **Install Extension**: [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)
2. **Create Wallet**: Set up a new wallet
3. **Get Test SUI**: Use faucet to get test tokens
4. **Copy Address**: Note your wallet address

### 5. Test Integration

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` and:

1. **Register/Login** with any credentials
2. **Connect Wallet** using the test panel
3. **Test Contract** connection
4. **Create Payment** request

## 🔧 Integration Components

### Wallet Provider
```typescript
// Wraps your app for wallet functionality
<WalletProvider>
  <App />
</WalletProvider>
```

### Payment Service
```typescript
import { paymentService } from './paymentService';

// Create crypto payment
const result = await paymentService.createCryptoPaymentRequest({
  amount: 1.0,
  currency: 'SUI',
  receiverDetails: '0x...',
  paymentMethod: 'crypto'
});
```

### Contract Interaction
```typescript
// Direct contract calls
const tx = await suiClient.signAndExecuteTransactionBlock({
  transactionBlock: {
    target: `${packageId}::blockchainpayment::create_payment_request`,
    arguments: [chatPayObjectId, receiver, amount, currency, ...],
  },
  signer: wallet
});
```

## 🧪 Testing Your Integration

### Test 1: Contract Connection
1. Open browser console
2. Click "Test Contract Connection"
3. Should see: ✅ Contract connected successfully!

### Test 2: Payment Request
1. Click "Test Payment Request"
2. Approve transaction in Sui Wallet
3. Should see transaction hash

### Test 3: View on Explorer
```bash
# Check transaction on testnet explorer
open https://suiexplorer.com/txblock/[TRANSACTION_HASH]?network=testnet
```

## 📊 Monitoring & Debugging

### Check Contract State
```bash
# View contract object
sui client object 0x7546734271f7a10d5c40be476f4121ef71fc0b4309095da9180788e6f8d982e9

# View payment requests
sui client dynamic-field 0x7546734271f7a10d5c40be476f4121ef71fc0b4309095da9180788e6f8d982e9
```

### Debug Common Issues

#### ❌ "Wallet not connected"
- Install Sui Wallet extension
- Refresh page and reconnect

#### ❌ "Insufficient balance"
- Get more test SUI from faucet
- Check balance: `sui client balance`

#### ❌ "Transaction failed"
- Check gas budget
- Verify contract addresses
- Check Sui Wallet approval

## 🎯 Next Steps

### Phase 1: Core Integration ✅
- [x] Smart contract deployed
- [x] Frontend configured
- [x] Wallet connection
- [x] Basic contract calls

### Phase 2: Payment Flow
- [ ] Complete crypto payment flow
- [ ] Fiat payment integration
- [ ] Real-time status updates
- [ ] Error handling

### Phase 3: Production Ready
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] User testing
- [ ] Performance optimization

## 🔗 Useful Links

- **Sui Documentation**: https://docs.sui.io/
- **Testnet Explorer**: https://suiexplorer.com/?network=testnet
- **Faucet**: https://faucet.testnet.sui.io/
- **Wallet**: https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil

## 🆘 Troubleshooting

### Common Errors:

1. **"Cannot find module '@mysten/sui.js'"**
   ```bash
   npm install
   # Restart dev server
   npm run dev
   ```

2. **"Wallet connection failed"**
   - Ensure Sui Wallet extension is installed
   - Try refreshing the page
   - Check browser console for errors

3. **"Transaction rejected"**
   - Check if you have sufficient test SUI
   - Verify contract addresses in `.env.local`
   - Try with smaller amounts first

## 🎉 You're All Set!

Your **ChatPay system** is now ready for **live Sui blockchain integration**! 🚀

**Start testing with small amounts and gradually increase complexity.** Happy building! 💰✨