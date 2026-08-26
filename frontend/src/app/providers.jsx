'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import { Toaster } from 'react-hot-toast';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#3ED6C4',
            accentColorForeground: '#12151C',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {mounted ? children : null}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1B1F29',
                color: '#ECEDEF',
                border: '1px solid #282D3B',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#3FA796',
                  secondary: '#12151C',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff5555',
                  secondary: '#12151C',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
