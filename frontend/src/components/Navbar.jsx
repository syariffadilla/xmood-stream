'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
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
} from 'lucide-react';

export default function Navbar({ onOpenCreate, onOpenFaucet }) {
  const pathname = usePathname();
  const { address, isConnected, chain } = useAccount();
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEcosystemOpen(false);
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

          {/* CENTER: Navigation Links & Ecosystem Dropdown */}
          <div className="hidden md:flex items-center space-x-2">
            <nav className="flex items-center space-x-1 bg-[#10131A] border border-[#282D3B] p-1 rounded-lg">
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

            {/* BOT Chain Ecosystem Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsEcosystemOpen(!isEcosystemOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-grotesk font-semibold transition-all ${
                  isEcosystemOpen
                    ? 'bg-[#1B1F29] border-[#3ED6C4]/60 text-[#3ED6C4]'
                    : 'bg-[#10131A] border-[#282D3B] text-[#8B92A3] hover:text-[#ECEDEF] hover:border-[#3ED6C4]/40'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#3ED6C4]" />
                <span>BOT Ecosystem</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isEcosystemOpen ? 'rotate-180 text-[#3ED6C4]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isEcosystemOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#161A23] border border-[#282D3B] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
                  <div className="px-2 py-1.5 mb-2 border-b border-[#282D3B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#3ED6C4] uppercase font-bold tracking-wider">
                      Official BOT Chain Hub
                    </span>
                    <span className="text-[10px] font-mono bg-[#1B1F29] px-1.5 py-0.5 rounded text-[#8B92A3]">
                      Native Coin: BOT
                    </span>
                  </div>

                  <div className="space-y-3">
                    {ecosystemLinks.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-[#656C7D] px-2 font-semibold">
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
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1B1F29] text-[#ECEDEF] group transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 rounded-md bg-[#10131A] text-[#3ED6C4] group-hover:bg-[#3ED6C4]/10 transition-colors">
                                  <LinkIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-grotesk font-semibold text-[#ECEDEF] group-hover:text-[#3ED6C4] transition-colors">
                                    {link.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#8B92A3]">
                                    {link.desc}
                                  </span>
                                </div>
                              </div>
                              <ExternalLink className="w-3 h-3 text-[#656C7D] group-hover:text-[#3ED6C4] transition-colors" />
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
                      className="px-3.5 py-1.5 rounded-lg bg-[#1B1F29] border border-[#3ED6C4]/50 text-[#3ED6C4] hover:bg-[#3ED6C4] hover:text-[#12151C] font-grotesk font-bold text-xs transition-all"
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
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[#282D3B]/60 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-grotesk font-medium ${
                  isActive ? 'bg-[#1B1F29] text-[#3ED6C4]' : 'text-[#8B92A3]'
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
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-[#3ED6C4] bg-[#1B1F29] font-mono text-[11px]"
          >
            <Compass className="w-3 h-3" />
            <span>BotScan</span>
          </a>
        </div>

      </div>
    </header>
  );
}
