import { ethers } from 'ethers';
import ganache from 'ganache-core';

declare global {
  namespace NodeJS {
    interface Global {
      server: ganache.Server;
      provider: ethers.providers.JsonRpcProvider;
      accounts: string[];
    }
  }
}
