'use client';

import { WalletProvider } from '@mysten/dapp-kit';
import { SuiClientProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
});

// Create a client
const queryClient = new QueryClient();

interface WalletWrapperProps {
  children: React.ReactNode;
}

export default function WalletWrapper({ children }: WalletWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}