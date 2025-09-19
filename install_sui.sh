#!/bin/bash

echo "🚀 Installing Sui packages for ChatPay..."

# Clean node_modules if needed
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Installing @mysten/sui..."
npm install @mysten/sui@^1.0.0

echo "📦 Installing @mysten/dapp-kit..."
npm install @mysten/dapp-kit@^0.12.0

# Verify installation
echo "✅ Verifying installation..."
npm list @mysten/sui @mysten/dapp-kit

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install Sui Wallet extension"
echo "2. Run: npm run dev"
echo "3. Test wallet connection"
echo "4. Test contract calls"
echo ""
echo "🔗 Useful links:"
echo "- Sui Wallet: https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
echo "- Testnet Explorer: https://suiexplorer.com/?network=testnet"
echo "- Documentation: https://docs.sui.io/"