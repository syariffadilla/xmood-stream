'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreatePostModal from '../components/CreatePostModal';
import FaucetModal from '../components/FaucetModal';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CORE_ABI } from '../contracts/abis';
import { Radio, ArrowRight, ShieldCheck, Coins, Sparkles, Send, Flame, MessageSquarePlus } from 'lucide-react';

export default function LandingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const { isConnected } = useAccount();

  // Read total posts
  const { data: totalPosts } = useReadContract({
    address: CONTRACT_ADDRESSES.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getTotalPosts',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#12151C] text-[#ECEDEF] selection:bg-[#3ED6C4] selection:text-[#12151C]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow flex flex-col items-center justify-start pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-12 pb-16">
        
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center gap-4 pt-6">
          <div className="inline-flex items-center space-x-2 bg-[#1B1F29] border border-[#282D3B] px-3 py-1 rounded-full text-xs font-mono text-[#8B92A3]">
            <span className="w-2 h-2 rounded-full bg-[#3ED6C4] animate-ping"></span>
            <span className="text-[#3ED6C4] font-medium">NETWORK: BASE SEPOLIA (84532)</span>
            <span>•</span>
            <span>SYSTEM: ONLINE</span>
          </div>

          <h1 className="font-grotesk font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#ECEDEF] max-w-4xl tracking-tight leading-tight">
            Post Updates, Get Tips in <span className="text-[#E8A33D]">USDT</span>, Earn <span className="text-[#3FA796]">$XMS</span> Rewards
          </h1>

          <p className="font-sans text-[#8B92A3] text-base sm:text-lg max-w-2xl mt-2 leading-relaxed">
            The decentralized SocialFi ledger where short-form microblogging drives direct creator tipping. 95% goes directly to creators, gas and loyalty is powered by $XMS.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link
              href="/feed"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-[#3ED6C4]/20 transition-all hover:-translate-y-0.5"
            >
              <Radio className="w-4 h-4 text-[#12151C]" />
              <span>Explore Live Feed</span>
            </Link>

            <button
              onClick={() => setIsFaucetOpen(true)}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-[#1B1F29] border border-[#282D3B] hover:border-[#E8A33D]/50 text-[#ECEDEF] font-grotesk font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              <Coins className="w-4 h-4 text-[#E8A33D]" />
              <span>Get Testnet mUSDT</span>
            </button>
          </div>

          <div className="mt-4 font-mono text-xs text-[#8B92A3] flex items-center space-x-4 opacity-70">
            <span>VERIFIED ON-CHAIN</span>
            <span>|</span>
            <span>NON-CUSTODIAL VAULT</span>
            <span>|</span>
            <span>TOTAL POSTS: {totalPosts ? totalPosts.toString() : '0'}</span>
          </div>
        </section>

        {/* Bento Grid: Live Preview & Protocol Mechanics */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          
          {/* Feed Preview (Left Bento) */}
          <div className="lg:col-span-7 bg-[#1B1F29] rounded-xl p-6 border border-[#282D3B] flex flex-col gap-4">
            <div className="flex justify-between items-center ledger-border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3ED6C4]"></span>
                <h2 className="font-grotesk font-bold text-lg text-[#ECEDEF]">
                  Live Stream Preview
                </h2>
              </div>
              <span className="font-mono text-xs text-[#3FA796] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3FA796] animate-pulse"></span>
                <span>SYNCED</span>
              </span>
            </div>

            {/* Sample Post Card 1 */}
            <div className="bg-[#10131A] rounded-lg p-4 border border-[#282D3B] hover:border-[#3ED6C4]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1B1F29] border border-[#282D3B] flex items-center justify-center font-mono text-xs font-bold text-[#3ED6C4]">
                    0x71
                  </div>
                  <div>
                    <div className="font-mono text-xs font-semibold text-[#ECEDEF]">
                      0x71C...3E2B
                    </div>
                    <div className="font-mono text-[11px] text-[#8B92A3]">
                      BLOCK #1928471 • 2 mins ago
                    </div>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#E8A33D]/20 text-[#E8A33D] font-mono text-xs font-semibold">
                  +15.00 USDT Tipped
                </div>
              </div>
              <p className="font-sans text-sm text-[#ECEDEF] my-3 leading-relaxed">
                Just deployed my first smart contract optimization on Base Sepolia. Gas fees reduced by 15%! ⚡🚀
              </p>
              <div className="flex items-center justify-between pt-2.5 ledger-border-t text-xs font-mono">
                <span className="text-[#8B92A3]">Receipt #10294</span>
                <Link
                  href="/feed"
                  className="flex items-center space-x-1 text-[#E8A33D] hover:underline"
                >
                  <span>Tip in USDT</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Sample Post Card 2 */}
            <div className="bg-[#10131A] rounded-lg p-4 border border-[#282D3B] opacity-80 hover:opacity-100 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1B1F29] border border-[#282D3B] flex items-center justify-center font-mono text-xs font-bold text-[#E8A33D]">
                    0xA3
                  </div>
                  <div>
                    <div className="font-mono text-xs font-semibold text-[#ECEDEF]">
                      0xA34...9F12
                    </div>
                    <div className="font-mono text-[11px] text-[#8B92A3]">
                      BLOCK #1928468 • 12 mins ago
                    </div>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#E8A33D]/20 text-[#E8A33D] font-mono text-xs font-semibold">
                  +5.00 USDT Tipped
                </div>
              </div>
              <p className="font-sans text-sm text-[#ECEDEF] my-3 leading-relaxed">
                Analyzing the latest SocialFi mechanics on L2 networks. Direct creator monetization is the future!
              </p>
              <div className="flex items-center justify-between pt-2.5 ledger-border-t text-xs font-mono">
                <span className="text-[#8B92A3]">Receipt #10293</span>
                <Link
                  href="/feed"
                  className="flex items-center space-x-1 text-[#E8A33D] hover:underline"
                >
                  <span>Tip in USDT</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <Link
              href="/feed"
              className="w-full py-2.5 text-center rounded-lg bg-[#10131A] border border-[#282D3B] hover:border-[#3ED6C4] text-[#ECEDEF] font-grotesk font-semibold text-xs transition-colors"
            >
              View Full Live Feed →
            </Link>
          </div>

          {/* Protocol Mechanics (Right Bento) */}
          <div className="lg:col-span-5 bg-[#1B1F29] rounded-xl p-6 border border-[#282D3B] flex flex-col gap-4">
            <div className="ledger-border-b pb-3">
              <h2 className="font-grotesk font-bold text-lg text-[#ECEDEF] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#3ED6C4]" />
                <span>Protocol Mechanics</span>
              </h2>
            </div>

            {/* Step 1 */}
            <div className="flex gap-4 items-start p-4 bg-[#10131A] rounded-lg border border-[#282D3B]">
              <div className="text-[#3ED6C4] font-mono font-bold text-2xl">01</div>
              <div>
                <h3 className="font-grotesk font-bold text-sm text-[#ECEDEF] mb-1">
                  Post & Stream
                </h3>
                <p className="font-sans text-xs text-[#8B92A3] leading-relaxed">
                  Publish alpha, mood, and insights on-chain to XMoodStreamCore.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start p-4 bg-[#10131A] rounded-lg border border-[#282D3B]">
              <div className="text-[#E8A33D] font-mono font-bold text-2xl">02</div>
              <div>
                <h3 className="font-grotesk font-bold text-sm text-[#ECEDEF] mb-1">
                  Direct USDT Tipping
                </h3>
                <p className="font-sans text-xs text-[#8B92A3] leading-relaxed">
                  Peers tip your post in mUSDT via TipVault. 95% goes directly to your wallet.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start p-4 bg-[#10131A] rounded-lg border border-[#282D3B]">
              <div className="text-[#3FA796] font-mono font-bold text-2xl">03</div>
              <div>
                <h3 className="font-grotesk font-bold text-sm text-[#ECEDEF] mb-1">
                  Earn $XMS Rewards
                </h3>
                <p className="font-sans text-xs text-[#8B92A3] leading-relaxed">
                  Claim $XMS reward tokens every 24h for active posting and receiving tips.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#10131A]/80 border border-[#282D3B] text-[11px] font-mono text-[#8B92A3]">
              <strong className="text-[#ECEDEF]">Base Sepolia Chain ID:</strong> 84532 | Nonce-enforced
            </div>

          </div>

        </section>

      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
