import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'X-Mood Stream',
  projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org', {
      batch: true,
      retryCount: 2,
      timeout: 8000,
    }),
  },
  ssr: false, // Client-side hydration for lightning fast UI rendering without SSR stalls
});
