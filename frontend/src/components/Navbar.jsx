'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { MOCK_USDT_ABI, REWARD_TOKEN_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import {
  Coins,
  Sparkles,
  MessageSquarePlus,
  Trophy,
  Gift,
  User,
  Radio,
  ExternalLink,
  ChevronDown,
  Globe,
  Droplets,
  ArrowLeftRight,
  ShieldCheck,
  Code2,
  Github,
  Compass,
  Wallet,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function Navbar({ onOpenCreate, onOpenFaucet }) {
  const pathname = usePathname();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEcosystemOpen(false);
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

  const isWrongChain = isConnected && chain && chain.id !== 968 && chain.id !== 677;

  const ecosystemLinks = [
    {
      category: 'Ecosystem & Tools',
      items: [
        {
          name: 'Official Website',
          href: 'https://www.botchain.ai',
          desc: 'High-performance AI & DePIN L1',
          icon: Globe,
        },
        {
          name: 'Testnet Faucet',
          href: 'https://faucet.botchain.ai',
          desc: 'Claim free testnet BOT',
          icon: Droplets,
        },
        {
          name: 'BDEX Swap',
          href: 'https://dex.botchain.ai/#/swap',
          desc: 'Decentralized exchange & liquidity',
          icon: ArrowLeftRight,
        },
        {
          name: 'Cross-Chain Bridge',
          href: 'https://bridge.botchain.ai',
          desc: 'Transfer assets across chains',
          icon: ShieldCheck,
        },
        {
          name: 'Official Wallet',
          href: 'https://wallet.botchain.ai',
          desc: 'BOT Chain native wallet',
          icon: Wallet,
        },
      ],
    },
    {
      category: 'Developers & Explorer',
      items: [
        {
          name: 'Block Explorer (BotScan)',
          href: 'https://scan.botchain.ai',
          desc: 'Inspect transactions & contracts',
          icon: Compass,
        },
        {
          name: 'Developer Documentation',
          href: 'https://dev-docs.botchain.ai/docs/Developers/quick-guide/',
          desc: 'Integration guides & APIs',
          icon: Code2,
        },
        {
          name: 'Official GitHub',
          href: 'https://github.com/BOTChain-bot',
          desc: 'Open-source code & SDKs',
          icon: Github,
        },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E293B] bg-[#090C15]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* LEFT: Logo & Network Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0] via-[#00D9F5] to-[#6366F1] flex items-center justify-center shadow-lg shadow-[#00F5A0]/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-mono font-extrabold text-[#090C15] text-sm">X</span>
              </div>
              <div className="flex items-baseline space-x-1 whitespace-nowrap">
                <span className="font-grotesk font-bold text-sm sm:text-base text-[#F3F4F6] tracking-tight group-hover:text-[#00F5A0] transition-colors">
                  X-Mood
                </span>
                <span className="hidden sm:inline font-grotesk font-semibold text-xs sm:text-sm text-[#94A3B8]">
                  Stream
                </span>
              </div>
            </Link>

            {/* Network indicator badge & 1-click switcher */}
            {isWrongChain ? (
              <button
                onClick={() => switchChain && switchChain({ chainId: 968 })}
                className="flex items-center space-x-1.5 bg-[#F59E0B]/20 border border-[#F59E0B] px-2.5 py-1 rounded-full text-[11px] font-mono text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#090C15] transition-all animate-pulse shadow-md"
                title="Click to switch wallet to BOT Chain Testnet"
              >
                <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                <span className="font-bold">Switch to BOT Chain</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 bg-[#0E131F] border border-[#1E293B] px-2 py-0.5 rounded-full text-[11px] font-mono text-[#00F5A0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] animate-pulse"></span>
                <span className="font-medium">{chain?.name || 'BOT Chain'}</span>
              </div>
            )}
          </div>

          {/* CENTER: Navigation Links & Ecosystem Dropdown (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            <nav className="flex items-center space-x-1 bg-[#0E131F] border border-[#1E293B] p-1 rounded-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-grotesk text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#182032] text-[#00F5A0] shadow-sm border border-[#1E293B]'
                        : 'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#182032]/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* BOT Chain Ecosystem Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsEcosystemOpen(!isEcosystemOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-grotesk font-semibold transition-all ${
                  isEcosystemOpen
                    ? 'bg-[#182032] border-[#00F5A0]/60 text-[#00F5A0]'
                    : 'bg-[#0E131F] border-[#1E293B] text-[#94A3B8] hover:text-[#F3F4F6] hover:border-[#00F5A0]/40'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#00F5A0]" />
                <span>Ecosystem</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isEcosystemOpen ? 'rotate-180 text-[#00F5A0]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isEcosystemOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0E131F] border border-[#1E293B] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
                  <div className="px-2 py-1.5 mb-2 border-b border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#00F5A0] uppercase font-bold tracking-wider">
                      BOT Chain Hub
                    </span>
                    <span className="text-[10px] font-mono bg-[#182032] px-1.5 py-0.5 rounded text-[#94A3B8]">
                      Native Coin: BOT
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    {ecosystemLinks.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-[#64748B] px-2 font-semibold">
                          {group.category}
                        </div>
                        {group.items.map((link) => {
                          const LinkIcon = link.icon;
                          return (
                            <a
                              key={link.name}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setIsEcosystemOpen(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-[#182032] text-[#F3F4F6] group transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 rounded-lg bg-[#090C15] text-[#00F5A0] group-hover:bg-[#00F5A0]/10 transition-colors">
                                  <LinkIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-grotesk font-semibold text-[#F3F4F6] group-hover:text-[#00F5A0] transition-colors">
                                    {link.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#94A3B8]">
                                    {link.desc}
                                  </span>
                                </div>
                              </div>
                              <ExternalLink className="w-3 h-3 text-[#64748B] group-hover:text-[#00F5A0] transition-colors" />
                            </a>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Balances, Faucet, Post CTA, Connect */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Quick Balances (Desktop 2xl / xl) */}
            {isConnected && (
              <div className="hidden 2xl:flex items-center space-x-2 bg-[#0E131F] border border-[#1E293B] px-2.5 py-1 rounded-xl text-xs font-mono">
                <span className="text-[#F59E0B] font-bold">
                  {usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(1) : '0'} <span className="text-[10px] font-normal text-[#94A3B8]">USDT</span>
                </span>
                <span className="text-[#1E293B]">/</span>
                <span className="text-[#00F5A0] font-bold">
                  {xmsBalance !== undefined ? parseFloat(formatUnits(xmsBalance, 18)).toFixed(1) : '0'} <span className="text-[10px] font-normal text-[#94A3B8]">XMS</span>
                </span>
              </div>
            )}

            {/* Faucet Button */}
            {onOpenFaucet && (
              <button
                onClick={onOpenFaucet}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#0E131F] border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10 text-xs font-mono font-medium transition-all"
                title="Get 100 testnet mUSDT"
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+100 Faucet</span>
              </button>
            )}

            {/* Create Post Button */}
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#6366F1] text-[#090C15] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-[#00F5A0]/20 transition-all hover:scale-[1.02]"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#090C15]" />
                <span>Post</span>
              </button>
            )}

            {/* RainbowKit Connect Button */}
            <ConnectButton.Custom>
              {({
                account,
                chain: activeChain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && activeChain;

                if (!ready) return null;

                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-[#0E131F] border border-[#00F5A0]/50 text-[#00F5A0] hover:bg-[#00F5A0] hover:text-[#090C15] font-grotesk font-bold text-xs transition-all shadow-sm"
                    >
                      Connect
                    </button>
                  );
                }

                if (activeChain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="px-2.5 py-1 rounded-xl bg-red-900/60 border border-red-500 text-red-200 font-mono text-xs font-semibold"
                    >
                      Switch Chain
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center space-x-1.5 bg-[#0E131F] border border-[#1E293B] hover:border-[#00F5A0]/50 px-2.5 py-1.5 rounded-xl transition-all text-xs font-mono text-[#F3F4F6]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse"></span>
                    <span>{account.displayName}</span>
                  </button>
                );
              }}
            </ConnectButton.Custom>

          </div>
        </div>

        {/* Mobile / Tablet Navigation Row */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[#1E293B]/80 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg font-grotesk font-medium transition-colors ${
                  isActive ? 'bg-[#182032] text-[#00F5A0]' : 'text-[#94A3B8] hover:text-[#F3F4F6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-[#00F5A0] bg-[#182032] border border-[#1E293B] font-mono text-[11px]"
          >
            <Compass className="w-3 h-3" />
            <span>BotScan</span>
          </a>
        </div>

      </div>
    </header>
  );
}
