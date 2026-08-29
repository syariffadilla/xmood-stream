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
  Zap,
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
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  // Read XMS balance
  const { data: xmsBalance } = useReadContract({
    address: contracts.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  const navItems = [
    { name: 'Feed', href: '/feed', icon: Radio },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Rewards', href: '/rewards', icon: Gift },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const formatBalance = (val, decimals = 6) => {
    if (val === undefined || val === null) return '0.00';
    const num = parseFloat(formatUnits(val, decimals));
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-base/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center space-x-3 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-gold font-display font-black text-sm shadow-sm group-hover:border-gold transition-colors">
            X
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-main leading-tight whitespace-nowrap">
              X-MOOD STREAM
            </span>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-sub leading-tight whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-glacier"></span>
              <span>{contracts.chainName}</span>
            </div>
          </div>
        </Link>

        {/* Center: Desktop Nav Pill Bar */}
        <nav className="hidden lg:flex items-center p-1 rounded-xl bg-surface/80 border border-line shadow-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

        {/* Right: Actions, Balance Capsule & Wallet */}
        <div className="flex items-center space-x-2.5 shrink-0">
          
          {/* Quick Faucet Button */}
          <button
            onClick={onOpenFaucet}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-sub hover:text-main text-xs font-mono transition-colors"
            title="Get testnet mUSDT tokens"
          >
            <Coins className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px]">Faucet</span>
          </button>

          {/* Quick Broadcast Button */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs shadow-xs transition-all active:scale-95"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Broadcast</span>
          </button>

          {/* Connected Balances Capsule */}
          {isConnected && (
            <div className="hidden md:flex items-center space-x-2.5 px-3 py-1 rounded-lg bg-surface border border-line font-mono text-xs shadow-xs">
              <div className="flex items-center space-x-1.5" title="mUSDT Tip Balance">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                <span className="font-semibold text-main">{formatBalance(usdtBalance, 6)}</span>
                <span className="text-[10px] text-sub">USDT</span>
              </div>
              <span className="text-line">|</span>
              <div className="flex items-center space-x-1.5" title="Claimed $XMS Rewards">
                <span className="w-1.5 h-1.5 rounded-full bg-glacier"></span>
                <span className="font-semibold text-glacier">{formatBalance(xmsBalance, 18)}</span>
                <span className="text-[10px] text-sub">XMS</span>
              </div>
            </div>
          )}

          {/* RainbowKit Wallet Connect */}
          <div className="connect-wrapper">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-surface border border-line text-sub hover:text-main transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden border-t border-line bg-surface/95 backdrop-blur-xl p-4 space-y-3 shadow-xl">
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

          {/* Mobile Balances Display */}
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

          {/* Action Buttons in Mobile */}
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
