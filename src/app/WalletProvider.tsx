'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWallets } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

interface WalletContextType {
  suiClient: SuiClient | null;
  connectedAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  wallets: any[]; // From dapp-kit
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useWallets();
  const [suiClient, setSuiClient] = React.useState<SuiClient | null>(null);
  const [connectedAddress, setConnectedAddress] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Initialize real Sui client
  React.useEffect(() => {
    const client = new SuiClient({
      url: getFullnodeUrl('testnet')
    });
    setSuiClient(client);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    // For now, mock connection - in production, use wallet adapters
    setTimeout(() => {
      setConnectedAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      setIsConnecting(false);
    }, 500);
  };

  const disconnectWallet = () => {
    setConnectedAddress(null);
  };

  const value = {
    suiClient,
    connectedAddress,
    connectWallet,
    disconnectWallet,
    isConnecting,
    wallets,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}