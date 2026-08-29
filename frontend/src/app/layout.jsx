import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'X-Mood Stream — On-Chain SocialFi Ledger',
  description: 'On-chain micro-publishing protocol with non-custodial 95% creator tipping settlement and daily activity rewards on BOT Chain.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-base text-main antialiased selection:bg-gold selection:text-base">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
