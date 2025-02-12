import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  isConnected: boolean;
  address: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const checkTronLink = async () => {
      try {
        // First check if TronLink is installed
        if (!window.tronLink) {
          console.log('Please install TronLink');
          return;
        }

        // Check if we're already connected from localStorage
        const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
        
        if (!isWalletConnected) {
          console.log('Not previously connected');
          return;
        }

        // Wait for TronLink to inject tronWeb
        let tronWebState = {
          installed: !!window.tronWeb,
          loggedIn: window.tronWeb && window.tronWeb.ready
        };

        if (!tronWebState.installed) {
          let tries = 0;
          const maxTries = 10;
          
          while (!tronWebState.installed && tries < maxTries) {
            tronWebState = {
              installed: !!window.tronWeb,
              loggedIn: window.tronWeb && window.tronWeb.ready
            };
            await new Promise(resolve => setTimeout(resolve, 1000));
            tries++;
          }
        }

        // Check if we're already logged in
        if (tronWebState.loggedIn && isWalletConnected) {
          const currentAddress = window.tronWeb.defaultAddress.base58;
          console.log('Already logged in:', currentAddress);
          setAddress(currentAddress);
          setIsConnected(true);
        }

        // Listen for account changes
        window.addEventListener('message', (e) => {
          if (e.data.message && e.data.message.action === "setAccount") {
            const newAddress = e.data.message.data.address;
            setAddress(newAddress);
            setIsConnected(true);
            localStorage.setItem('walletConnected', 'true');
            console.log('Account changed:', newAddress);
          }
          if (e.data.message && e.data.message.action === "setNode") {
            console.log('Network changed:', e.data.message.data.node);
          }
          if (e.data.message && e.data.message.action === "disconnect") {
            setAddress('');
            setIsConnected(false);
            localStorage.removeItem('walletConnected');
            console.log('Disconnected');
          }
        });

      } catch (error) {
        console.error('Error checking TronLink:', error);
      }
    };

    checkTronLink();
  }, []);

  const connect = async () => {
    try {
      if (!window.tronLink) {
        toast({
          title: "TronLink Not Found",
          description: "Please install TronLink wallet and try again",
          variant: "destructive",
        });
        return;
      }

      try {
        const account = await window.tronLink.request({
          method: 'tron_requestAccounts'
        });

        if (!account) {
          throw new Error('No account found');
        }

        let tries = 0;
        while (!window.tronWeb?.ready && tries < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          tries++;
        }

        if (!window.tronWeb?.ready) {
          throw new Error('TronWeb not ready');
        }

        const address = window.tronWeb.defaultAddress.base58;
        setAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletConnected', 'true');
        
        toast({
          title: "Connected Successfully",
          description: "Your wallet is now connected",
        });

      } catch (error) {
        console.error('TronLink request error:', error);
        toast({
          title: "Connection Failed",
          description: "Please unlock your TronLink wallet and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Please make sure TronLink is installed and unlocked",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    setAddress('');
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
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