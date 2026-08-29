'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { getContractAddresses } from '../contracts/addresses';
import { MOCK_USDT_ABI, REWARD_TOKEN_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import {
  Coins,
  Sparkles,
  PenSquare,
  Trophy,
  Gift,
  User,
  Radio,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

export default function Navbar({ onOpenCreate, onOpenFaucet }) {
  const pathname = usePathname();
  const { address, isConnected, chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close mobile drawer on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Read mUSDT balance
  const { data: usdtBalance } = useReadContract({
    address: contracts.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Read XMS balance
  const { data: xmsBalance } = useReadContract({
    address: contracts.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const navItems = [
    { name: 'Feed', href: '/feed', icon: Radio },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Rewards', href: '/rewards', icon: Gift },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const formatBalance = (val, decimals = 6) => {
    if (val === undefined || val === null) return '0.0';
    const num = parseFloat(formatUnits(val, decimals));
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-base/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* 1. Left: Brand */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-gold font-display font-black text-sm shadow-sm group-hover:border-gold transition-colors">
            X
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-main leading-tight whitespace-nowrap">
              X-MOOD STREAM
            </span>
            <div className="hidden sm:flex items-center space-x-1 text-[10px] font-mono text-sub leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-glacier"></span>
              <span>{contracts.chainName}</span>
            </div>
          </div>
        </Link>

        {/* 2. Center: Desktop Nav Pill Segment */}
        <nav className="hidden lg:flex items-center p-1 rounded-xl bg-surface/90 border border-line shadow-xs shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-elevated text-main font-semibold border border-line shadow-xs'
                    : 'text-sub hover:text-main hover:bg-elevated/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-sub'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right Action Cluster */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Quick Faucet Icon Button (Desktop) */}
          <button
            onClick={onOpenFaucet}
            className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-sub hover:text-main text-xs font-mono transition-colors"
            title="Get testnet mUSDT tokens"
          >
            <Coins className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px]">Faucet</span>
          </button>

          {/* Broadcast CTA Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>

          {/* Custom RainbowKit Connect Button (100% Responsive & Zero Clipping) */}
          <div className="shrink-0">
            <ConnectButton.Custom>
              {({
                account,
                chain: connectedChain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && connectedChain;

                if (!ready) {
                  return (
                    <div className="h-8 w-24 rounded-lg bg-surface animate-pulse" />
                  );
                }

                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-main font-display font-semibold text-xs shadow-xs transition-colors"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (connectedChain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center space-x-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Wrong Network</span>
                    </button>
                  );
                }

                return (
                  <div className="flex items-center space-x-1.5">
                    
                    {/* Chain Switcher Button */}
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-main text-xs font-mono transition-colors"
                      title={connectedChain.name}
                    >
                      {connectedChain.hasIcon && (
                        <div
                          className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0"
                          style={{ background: connectedChain.iconBackground }}
                        >
                          {connectedChain.iconUrl && (
                            <img
                              alt={connectedChain.name ?? 'Chain icon'}
                              src={connectedChain.iconUrl}
                              className="w-3.5 h-3.5"
                            />
                          )}
                        </div>
                      )}
                      <span className="hidden xl:inline max-w-[90px] truncate text-[11px]">
                        {connectedChain.name}
                      </span>
                      <ChevronDown className="w-3 h-3 text-sub" />
                    </button>

                    {/* Account Button */}
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-main text-xs font-mono shadow-xs transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-gold shrink-0"></div>
                      <span className="font-semibold text-[11px] sm:text-xs">
                        {account.displayName}
                      </span>
                    </button>

                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Mobile/Tablet Menu Button (Visible on < lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-surface border border-line text-sub hover:text-main transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer (When Open) */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden border-t border-line bg-surface/98 backdrop-blur-2xl p-4 space-y-3 shadow-2xl">
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-elevated text-main font-semibold border border-line shadow-xs'
                      : 'text-sub hover:text-main hover:bg-elevated/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-sub'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Balances Display in Drawer */}
          {isConnected && (
            <div className="p-3 rounded-lg bg-base border border-line flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                <span className="text-sub">USDT:</span>
                <strong className="text-main">{formatBalance(usdtBalance, 6)}</strong>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-glacier"></span>
                <span className="text-sub">XMS:</span>
                <strong className="text-glacier">{formatBalance(xmsBalance, 18)}</strong>
              </div>
            </div>
          )}

          {/* Action Buttons in Drawer */}
          <div className="pt-2 border-t border-line flex gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCreate();
              }}
              className="flex-1 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenFaucet();
              }}
              className="flex-1 py-2.5 rounded-lg bg-elevated border border-line text-main text-xs font-medium flex items-center justify-center space-x-1.5 hover:bg-line transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-gold" />
              <span>Faucet</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
