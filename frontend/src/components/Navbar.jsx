'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { MOCK_USDT_ABI, REWARD_TOKEN_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import { Coins, Sparkles, MessageSquarePlus, Trophy, Gift, User, Radio, ExternalLink } from 'lucide-react';

export default function Navbar({ onOpenCreate, onOpenFaucet }) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  // Read mUSDT balance
  const { data: usdtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read XMS balance
  const { data: xmsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const navItems = [
    { name: 'Feed', href: '/feed', icon: Radio },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Rewards', href: '/rewards', icon: Gift },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#282D3B] bg-[#12151C]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* LEFT: Logo & Network Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#3ED6C4] to-[#1E56E0] flex items-center justify-center shadow-md shadow-[#3ED6C4]/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-mono font-extrabold text-white text-sm">X</span>
              </div>
              <div className="flex items-baseline space-x-1.5 whitespace-nowrap">
                <span className="font-grotesk font-bold text-base text-[#ECEDEF] tracking-tight group-hover:text-[#3ED6C4] transition-colors">
                  X-Mood Stream
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center space-x-1.5 bg-[#1B1F29] border border-[#282D3B] px-2 py-0.5 rounded text-[11px] font-mono text-[#3ED6C4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ED6C4] animate-pulse"></span>
              <span className="font-medium">{chain?.name || 'BOT Chain'}</span>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#10131A] border border-[#282D3B] p-1 rounded-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-grotesk text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1B1F29] text-[#3ED6C4] shadow-sm border border-[#282D3B]'
                      : 'text-[#8B92A3] hover:text-[#ECEDEF] hover:bg-[#1B1F29]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Balances, Faucet, Post CTA, Connect */}
          <div className="flex items-center space-x-2.5 shrink-0">
            
            {/* Quick Balances */}
            {isConnected && (
              <div className="hidden xl:flex items-center space-x-2 bg-[#1B1F29] border border-[#282D3B] px-2.5 py-1 rounded-lg text-xs font-mono">
                <span className="text-[#E8A33D] font-bold">
                  {usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(1) : '0'} <span className="text-[10px] font-normal text-[#8B92A3]">USDT</span>
                </span>
                <span className="text-[#282D3B]">/</span>
                <span className="text-[#3FA796] font-bold">
                  {xmsBalance !== undefined ? parseFloat(formatUnits(xmsBalance, 18)).toFixed(1) : '0'} <span className="text-[10px] font-normal text-[#8B92A3]">XMS</span>
                </span>
              </div>
            )}

            {/* Faucet Button */}
            {onOpenFaucet && (
              <button
                onClick={onOpenFaucet}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1B1F29] border border-[#E8A33D]/40 text-[#E8A33D] hover:bg-[#E8A33D]/10 text-xs font-mono font-medium transition-all"
                title="Get 100 testnet mUSDT (Gasless)"
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+100 Faucet</span>
                <span className="sm:hidden">Faucet</span>
              </button>
            )}

            {/* Create Post Button */}
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-sm shadow-[#3ED6C4]/20 transition-all"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#12151C]" />
                <span>Post</span>
              </button>
            )}

            {/* RainbowKit Connect Button */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                if (!ready) return null;

                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg bg-[#1B1F29] border border-[#3ED6C4]/50 text-[#3ED6C4] hover:bg-[#3ED6C4] hover:text-[#12151C] font-grotesk font-bold text-xs transition-all"
                    >
                      Connect
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-red-900/60 border border-red-500 text-red-200 font-mono text-xs font-semibold"
                    >
                      Switch Chain
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center space-x-1.5 bg-[#1B1F29] border border-[#282D3B] hover:border-[#3ED6C4]/50 px-2.5 py-1.5 rounded-lg transition-all text-xs font-mono text-[#ECEDEF]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3ED6C4]"></span>
                    <span>{account.displayName}</span>
                  </button>
                );
              }}
            </ConnectButton.Custom>

          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#282D3B]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-grotesk font-medium ${
                  isActive ? 'bg-[#1B1F29] text-[#3ED6C4]' : 'text-[#8B92A3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
