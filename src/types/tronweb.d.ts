declare interface TronWeb {
  defaultAddress: {
    base58: string;
    hex: string;
  };
  ready: boolean;
  fullNode: {
    host: string;
  };
  solidityNode: {
    host: string;
  };
  eventServer: {
    host: string;
  };
  contract(): {
    at(address: string): Promise<{
      transfer(recipient: string, amount: string): {
        send(options?: any): Promise<string>;
      };
    }>;
  };
  trx: {
    getBalance(address: string): Promise<number>;
  };
  address: {
    fromHex(hex: string): string;
    toHex(base58: string): string;
  };
}

declare interface Window {
  tronWeb?: TronWeb;
}

export type { TronWeb }; 