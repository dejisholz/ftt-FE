'use client';

import { useEffect, useState } from 'react';
import { WalletProvider } from '@/contexts/WalletContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Clear wallet connection state on initial load if needed
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    if (isWalletConnected && (!window.tronWeb || !window.tronWeb.ready)) {
      localStorage.removeItem('walletConnected');
    }
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <WalletProvider>{children}</WalletProvider>;
} 