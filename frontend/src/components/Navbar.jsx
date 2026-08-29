'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { CONTRACT_ADDRESSES, getContractAddresses } from '../contracts/addresses';
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
  ExternalLink,
  ChevronDown,
  Globe,
  Wallet,
  Menu,
  X,
  Check,
} from 'lucide-react';

export default function Navbar({ onOpenCreate, onOpenFaucet }) {
  const pathname = usePathname();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const contracts = getContractAddresses(chain?.id);
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const networkRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEcosystemOpen(false);
      }
      if (networkRef.current && !networkRef.current.contains(event.target)) {
        setIsNetworkMenuOpen(false);
      }
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

  const isWrongChain = isConnected && chain && chain.id !== 968 && chain.id !== 677;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-base/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-main font-display font-bold text-sm group-hover:border-gold transition-colors">
              X
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight text-main">
                X-Mood Stream
              </span>
              <span className="font-mono text-[10px] text-sub uppercase tracking-wider">
                SocialFi Ledger
              </span>
            </div>
          </Link>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-surface text-main font-semibold border border-line'
                      : 'text-sub hover:text-main hover:bg-surface/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-sub'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & Wallet */}
        <div className="flex items-center space-x-2.5">
          
          {/* Quick Broadcast Button */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-main text-xs font-medium transition-colors"
          >
            <PenSquare className="w-3.5 h-3.5 text-gold" />
            <span>Broadcast</span>
          </button>

          {/* Faucet Trigger */}
          <button
            onClick={onOpenFaucet}
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-line text-sub hover:text-main text-xs font-mono transition-colors"
            title="Get testnet mUSDT tokens"
          >
            <Coins className="w-3.5 h-3.5 text-gold" />
            <span>Faucet</span>
          </button>

          {/* Token Balances (When Connected) */}
          {isConnected && (
            <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-surface border border-line text-xs font-mono">
              <span className="text-gold font-medium">
                {usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(1) : '0.0'} <span className="text-[10px] text-sub">USDT</span>
              </span>
              <span className="text-line">•</span>
              <span className="text-glacier font-medium">
                {xmsBalance !== undefined ? parseFloat(formatUnits(xmsBalance, 18)).toFixed(1) : '0.0'} <span className="text-[10px] text-sub">XMS</span>
              </span>
            </div>
          )}

          {/* RainbowKit Wallet Connect */}
          <div className="connect-button-wrapper">
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
            className="md:hidden p-1.5 rounded-lg bg-surface border border-line text-sub hover:text-main transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden border-t border-line bg-surface p-4 space-y-3">
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
                      ? 'bg-elevated text-main font-semibold border border-line'
                      : 'text-sub hover:text-main hover:bg-elevated/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-sub'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-line flex gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCreate();
              }}
              className="flex-1 py-2 rounded-lg bg-elevated border border-line text-main text-xs font-medium flex items-center justify-center space-x-1.5"
            >
              <PenSquare className="w-3.5 h-3.5 text-gold" />
              <span>Broadcast</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenFaucet();
              }}
              className="flex-1 py-2 rounded-lg bg-elevated border border-line text-main text-xs font-medium flex items-center justify-center space-x-1.5"
            >
              <Coins className="w-3.5 h-3.5 text-gold" />
              <span>Get mUSDT</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
