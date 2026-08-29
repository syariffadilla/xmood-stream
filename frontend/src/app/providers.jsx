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
            accentColor: '#D4A853',
            accentColorForeground: '#11161B',
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
                background: '#181F26',
                color: '#F0F3F6',
                border: '1px solid #283542',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#D4A853',
                  secondary: '#11161B',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#11161B',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
