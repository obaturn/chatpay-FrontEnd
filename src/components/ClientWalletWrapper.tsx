'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import wallet components to avoid SSR issues
const WalletWrapper = dynamic(() => import('./WalletWrapper'), {
  ssr: false,
  loading: () => <>{null}</>
});

interface ClientWalletWrapperProps {
  children: ReactNode;
}

export default function ClientWalletWrapper({ children }: ClientWalletWrapperProps) {
  return (
    <WalletWrapper>
      {children}
    </WalletWrapper>
  );
}