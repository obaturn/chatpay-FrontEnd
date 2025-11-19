import '../src/app/globals.css';
import { AuthProvider } from '../src/components/AuthContext';
import WalletWrapper from '../src/components/WalletWrapper';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <WalletWrapper>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </WalletWrapper>
  );
}