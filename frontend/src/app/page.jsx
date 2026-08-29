'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreatePostModal from '../components/CreatePostModal';
import FaucetModal from '../components/FaucetModal';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, getContractAddresses, parsePostContent } from '../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import { Radio, ArrowRight, ShieldCheck, Coins, Sparkles, Send, Flame, MessageSquarePlus } from 'lucide-react';

export default function LandingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const { isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContractAddresses(chain?.id);

  const [previewPosts, setPreviewPosts] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Read total posts with active auto-refresh
  const { data: totalPosts, refetch: refetchTotal } = useReadContract({
    address: contracts.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getTotalPosts',
    query: {
      refetchInterval: 4000,
    },
  });

  // Fetch latest real on-chain stream preview
  useEffect(() => {
    async function loadLatestPreview() {
      if (!publicClient) return;
      setLoadingPreview(true);
      try {
        const count = await publicClient.readContract({
          address: contracts.XMoodStreamCore,
          abi: CORE_ABI,
          functionName: 'getTotalPosts',
        });
        const total = Number(count);
        const indices = [];
        for (let i = total; i >= Math.max(1, total - 1); i--) {
          indices.push(i);
        }

        if (indices.length > 0) {
          const results = await Promise.all(
            indices.map(async (postId) => {
              try {
                const [post, tipRaw] = await Promise.all([
                  publicClient.readContract({
                    address: contracts.XMoodStreamCore,
                    abi: CORE_ABI,
                    functionName: 'getPost',
                    args: [BigInt(postId)],
                  }),
                  publicClient.readContract({
                    address: contracts.TipVault,
                    abi: TIP_VAULT_ABI,
                    functionName: 'postTips',
                    args: [BigInt(postId)],
                  }).catch(() => 0n),
                ]);

                const parsed = parsePostContent(post.contentHash);
                return {
                  id: Number(post.id),
                  author: post.author,
                  content: parsed.text,
                  mediaUrl: parsed.mediaUrl,
                  timestamp: Number(post.timestamp),
                  tipsUsdt: parseFloat(formatUnits(tipRaw || 0n, 6)),
                };
              } catch (e) {
                return null;
              }
            })
          );
          const valid = results.filter(Boolean);
          if (valid.length > 0) {
            setPreviewPosts(valid);
            return;
          }
        }

        // Fallback default preview if 0 posts on chain
        setPreviewPosts([
          {
            id: 1,
            author: '0x71C86B6D199343335298539038283920193E3E2B',
            content: 'Just deployed smart contract optimizations on BOT Chain. Gas fees reduced with instant finality! ⚡🚀',
            timestamp: Math.floor(Date.now() / 1000) - 120,
            tipsUsdt: 15.0,
          },
          {
            id: 2,
            author: '0xA34749281726354819203847561928374659F12',
            content: 'The dual-token SocialFi economy on BOT Chain ($XMS gas rebates + USDT tips) empowers genuine web3 creators!',
            timestamp: Math.floor(Date.now() / 1000) - 720,
            tipsUsdt: 5.0,
          },
        ]);
      } catch (err) {
        console.warn('Preview posts fetch fallback:', err);
      } finally {
        setLoadingPreview(false);
      }
    }

    loadLatestPreview();
  }, [publicClient, totalPosts, contracts.XMoodStreamCore, contracts.TipVault]);

  const displayTotalPosts = totalPosts !== undefined ? totalPosts.toString() : '0';

  return (
    <div className="min-h-screen flex flex-col bg-[#090C15] text-[#F3F4F6] selection:bg-[#00F5A0] selection:text-[#090C15]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow flex flex-col items-center justify-start pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-8 sm:gap-12 pb-16">
        
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center gap-4 pt-4 sm:pt-6">
          <div className="inline-flex items-center space-x-2 bg-[#0E131F] border border-[#1E293B] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#94A3B8] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-ping"></span>
            <span className="text-[#00F5A0] font-medium">NETWORK: {contracts.chainName.toUpperCase()} ({contracts.chainId})</span>
            <span>•</span>
            <span>SYSTEM: ONLINE</span>
          </div>

          <h1 className="font-grotesk font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#F3F4F6] max-w-4xl tracking-tight leading-tight sm:leading-tight">
            Post Updates, Get Tips in <span className="text-[#F59E0B]">USDT</span>, Earn <span className="text-[#00F5A0]">$XMS</span> Rewards
          </h1>

          <p className="font-sans text-[#94A3B8] text-sm sm:text-lg max-w-2xl mt-1 leading-relaxed">
            The decentralized SocialFi ledger where microblogging drives direct creator tipping. 95% goes directly to creators, gas and loyalty is powered by $XMS on BOT Chain.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Link
              href="/feed"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#6366F1] text-[#090C15] font-grotesk font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-[#00F5A0]/20 transition-all hover:-translate-y-0.5"
            >
              <Radio className="w-4 h-4 text-[#090C15]" />
              <span>Explore Live Feed</span>
            </Link>

            <button
              onClick={() => setIsFaucetOpen(true)}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#0E131F] border border-[#1E293B] hover:border-[#F59E0B]/50 text-[#F3F4F6] font-grotesk font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              <Coins className="w-4 h-4 text-[#F59E0B]" />
              <span>Get Free mUSDT</span>
            </button>
          </div>

          <div className="mt-2 font-mono text-[11px] sm:text-xs text-[#64748B] flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span>VERIFIED ON-CHAIN</span>
            <span className="hidden sm:inline">|</span>
            <span>NON-CUSTODIAL VAULT</span>
            <span className="hidden sm:inline">|</span>
            <span className="text-[#00F5A0] font-bold">TOTAL POSTS: {displayTotalPosts}</span>
          </div>
        </section>

        {/* Bento Grid: Live Preview & Protocol Mechanics */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
          
          {/* Feed Preview (Left Bento) */}
          <div className="lg:col-span-7 bg-[#0E131F] rounded-2xl p-5 sm:p-6 border border-[#1E293B] flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center ledger-border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0]"></span>
                <h2 className="font-grotesk font-bold text-base sm:text-lg text-[#F3F4F6]">
                  Live Stream Preview
                </h2>
              </div>
              <span className="font-mono text-xs text-[#00F5A0] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] animate-pulse"></span>
                <span>SYNCED ({displayTotalPosts} On-Chain)</span>
              </span>
            </div>

            {/* Dynamic Post Cards */}
            {previewPosts.map((p, idx) => (
              <div
                key={p.id || idx}
                className={`bg-[#090C15] rounded-xl p-4 border border-[#1E293B] hover:border-[#00F5A0]/40 transition-all ${
                  idx === 1 ? 'opacity-85 hover:opacity-100' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0E131F] border border-[#1E293B] flex items-center justify-center font-mono text-xs font-bold text-[#00F5A0]">
                      {p.author ? p.author.slice(2, 4).toUpperCase() : '0x'}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-semibold text-[#F3F4F6]">
                        {p.author ? `${p.author.slice(0, 6)}...${p.author.slice(-4)}` : '0xCreator'}
                      </div>
                      <div className="font-mono text-[11px] text-[#94A3B8]">
                        TX #{p.id} • {p.timestamp > 0 ? new Date(p.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-xs font-semibold border border-[#F59E0B]/30">
                    +{p.tipsUsdt.toFixed(2)} USDT Tipped
                  </div>
                </div>
                <p className="font-sans text-sm text-[#F3F4F6] my-3 leading-relaxed">
                  {p.content}
                </p>
                <div className="flex items-center justify-between pt-2.5 ledger-border-t text-xs font-mono">
                  <span className="text-[#94A3B8]">Stream #{p.id}</span>
                  <Link
                    href="/feed"
                    className="flex items-center space-x-1 text-[#F59E0B] hover:underline font-semibold"
                  >
                    <span>Tip in USDT</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}

            <Link
              href="/feed"
              className="w-full py-2.5 text-center rounded-xl bg-[#090C15] border border-[#1E293B] hover:border-[#00F5A0] text-[#F3F4F6] font-grotesk font-semibold text-xs transition-colors"
            >
              View Full Live Feed →
            </Link>
          </div>

          {/* Protocol Mechanics (Right Bento) */}
          <div className="lg:col-span-5 bg-[#0E131F] rounded-2xl p-5 sm:p-6 border border-[#1E293B] flex flex-col gap-4 shadow-xl">
            <div className="ledger-border-b pb-3">
              <h2 className="font-grotesk font-bold text-base sm:text-lg text-[#F3F4F6] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#00F5A0]" />
                <span>Protocol Mechanics</span>
              </h2>
            </div>

            {/* Step 1 */}
            <div className="flex gap-3.5 items-start p-4 bg-[#090C15] rounded-xl border border-[#1E293B]">
              <div className="text-[#00F5A0] font-mono font-bold text-xl sm:text-2xl">01</div>
              <div>
                <h3 className="font-grotesk font-bold text-sm text-[#F3F4F6] mb-1">
                  Post & Stream
                </h3>
                <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                  Publish alpha, mood, and insights on-chain to XMoodStreamCore.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3.5 items-start p-4 bg-[#090C15] rounded-xl border border-[#1E293B]">
              <div className="text-[#F59E0B] font-mono font-bold text-xl sm:text-2xl">02</div>
              <div>
                <h3 className="font-grotesk font-bold text-sm text-[#F3F4F6] mb-1">
                  Direct USDT Tipping
                </h3>
                <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                  Peers tip your post in mUSDT via TipVault. 95% goes directly to your wallet.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3.5 items-start p-4 bg-[#090C15] rounded-xl border border-[#1E293B]">
              <div className="text-[#00F5A0] font-mono font-bold text-xl sm:text-2xl">03</div>
              <div>
                <h3 className="font-grotesk font-bold text-sm text-[#F3F4F6] mb-1">
                  Earn $XMS Rewards
                </h3>
                <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                  Claim $XMS reward tokens every 24h for active posting and receiving tips.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090C15]/90 border border-[#1E293B] text-[11px] font-mono text-[#94A3B8]">
              <strong className="text-[#F3F4F6]">{contracts.chainName} Chain ID:</strong> {contracts.chainId} | Nonce-enforced
            </div>

          </div>

        </section>

      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={() => {
          setTimeout(() => {
            refetchTotal();
          }, 3500);
        }}
      />
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
