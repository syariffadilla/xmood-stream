import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'X-Mood Stream — SocialFi Tipping & Rewards',
  description: 'Decentralized SocialFi micro-blogging on Base Sepolia. Post updates, tip in USDT, and earn $XMS rewards.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#12151C] text-[#ECEDEF] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
