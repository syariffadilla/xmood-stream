import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { http } from 'viem';

export const botchainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
    public: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOT Scan', url: 'https://scan.botchain.ai' },
  },
  testnet: true,
});

export const botchain = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
    public: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: { name: 'BOT Scan', url: 'https://scan.botchain.ai' },
  },
  testnet: false,
});

export const config = getDefaultConfig({
  appName: 'X-Mood Stream',
  projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
  chains: [botchain, botchainTestnet],
  transports: {
    [botchain.id]: http('https://rpc.botchain.ai', {
      batch: true,
      retryCount: 2,
      timeout: 10000,
    }),
    [botchainTestnet.id]: http('https://rpc.bohr.life', {
      batch: true,
      retryCount: 2,
      timeout: 10000,
    }),
  },
  ssr: false,
});
