'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreatePostModal from '../components/CreatePostModal';
import FaucetModal from '../components/FaucetModal';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { getContractAddresses, parsePostContent } from '../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import { Radio, ArrowRight, ShieldCheck, Coins, Sparkles, Send, Layers, ExternalLink, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContractAddresses(chain?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [livePosts, setLivePosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Read total posts from core contract with active polling
  const { data: totalPostsData } = useReadContract({
    address: contracts.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getTotalPosts',
    query: { refetchInterval: 4000 },
  });

  const totalPosts = totalPostsData ? Number(totalPostsData) : 0;

  // Load preview stream posts from on-chain
  useEffect(() => {
    let isMounted = true;

    async function loadLiveFeed() {
      if (!publicClient || !contracts.XMoodStreamCore) return;
      try {
        setLoadingPosts(true);
        const count = await publicClient.readContract({
          address: contracts.XMoodStreamCore,
          abi: CORE_ABI,
          functionName: 'getTotalPosts',
        });

        const total = Number(count);
        if (total === 0) {
          if (isMounted) {
            setLivePosts([]);
            setLoadingPosts(false);
          }
          return;
        }

        const fetchCount = Math.min(total, 4);
        const postPromises = [];

        for (let i = total; i > total - fetchCount; i--) {
          postPromises.push(
            (async () => {
              try {
                const post = await publicClient.readContract({
                  address: contracts.XMoodStreamCore,
                  abi: CORE_ABI,
                  functionName: 'getPost',
                  args: [BigInt(i)],
                });

                let tips = BigInt(0);
                try {
                  tips = await publicClient.readContract({
                    address: contracts.TipVault,
                    abi: TIP_VAULT_ABI,
                    functionName: 'postTips',
                    args: [BigInt(i)],
                  });
                } catch (e) {}

                return {
                  id: Number(post.id),
                  author: post.author,
                  rawContent: post.contentHash,
                  timestamp: Number(post.timestamp),
                  tipsEarned: parseFloat(formatUnits(tips, 6)),
                };
              } catch (e) {
                return null;
              }
            })()
          );
        }

        const results = await Promise.all(postPromises);
        if (isMounted) {
          setLivePosts(results.filter(Boolean));
          setLoadingPosts(false);
        }
      } catch (err) {
        if (isMounted) setLoadingPosts(false);
      }
    }

    loadLiveFeed();
    const interval = setInterval(loadLiveFeed, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [publicClient, contracts.XMoodStreamCore, contracts.TipVault]);

  return (
    <div className="min-h-screen flex flex-col bg-base text-main selection:bg-gold selection:text-base">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface border border-line text-sub text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-glacier animate-pulse"></span>
            <span>Live on {contracts.chainName}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-main max-w-3xl mx-auto leading-tight sm:leading-tight">
            Verifiable micro-publishing with direct settlement.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-sub max-w-2xl mx-auto leading-relaxed">
            Every broadcast is an immutable on-chain record. Every tip splits 95% straight to the creator&apos;s wallet with non-custodial smart contract transparency.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/feed"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gold hover:bg-gold-hover text-base font-display font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Radio className="w-4 h-4" />
              <span>Explore Live Stream</span>
            </Link>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface hover:bg-elevated border border-line text-main font-display font-medium text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4 text-gold" />
              <span>Broadcast Update</span>
            </button>
          </div>

          {/* Telemetry Strip */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            
            <div className="p-4 rounded-lg bg-surface border border-line text-left">
              <div className="text-[11px] font-mono text-sub uppercase">On-Chain Streams</div>
              <div className="text-2xl font-mono font-bold text-main mt-1">
                {totalPosts}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-line text-left">
              <div className="text-[11px] font-mono text-sub uppercase">Creator Split</div>
              <div className="text-2xl font-mono font-bold text-gold mt-1">
                95%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-line text-left">
              <div className="text-[11px] font-mono text-sub uppercase">Protocol Treasury</div>
              <div className="text-2xl font-mono font-bold text-sub mt-1">
                5%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-line text-left">
              <div className="text-[11px] font-mono text-sub uppercase">Daily Activity Pool</div>
              <div className="text-2xl font-mono font-bold text-glacier mt-1">
                $XMS
              </div>
            </div>

          </div>

        </section>

        {/* Live Ledger Stream Preview */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded bg-gold"></span>
              <h2 className="font-display font-bold text-base text-main">
                Recent On-Chain Broadcasts
              </h2>
            </div>
            <Link
              href="/feed"
              className="text-xs font-mono text-sub hover:text-gold flex items-center space-x-1 transition-colors"
            >
              <span>View full feed</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loadingPosts ? (
              <div className="p-8 rounded-lg bg-surface border border-line text-center text-sub font-mono text-xs">
                Synchronizing with {contracts.chainName} ledger...
              </div>
            ) : livePosts.length === 0 ? (
              <div className="p-8 rounded-lg bg-surface border border-line text-center space-y-2">
                <p className="text-main font-medium text-sm">No broadcasts found on this network yet.</p>
                <p className="text-sub text-xs">Be the first to publish an on-chain update to initialize the feed.</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-3 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs transition-colors"
                >
                  Publish First Broadcast
                </button>
              </div>
            ) : (
              livePosts.map((post) => {
                const parsed = parsePostContent(post.rawContent);
                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-lg bg-surface border border-line hover:border-sub/40 transition-colors"
                  >
                    {/* Header: Author & Settlement Badge */}
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-sub">
                        {post.author.slice(0, 6)}...{post.author.slice(-4)}
                      </span>
                      {post.tipsEarned > 0 && (
                        <span className="px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold font-medium text-[11px]">
                          +{post.tipsEarned.toFixed(2)} USDT Tipped
                        </span>
                      )}
                    </div>

                    {/* Tag + Text */}
                    {parsed.tag && (
                      <span className="inline-block text-[11px] font-mono text-glacier font-medium mb-1">
                        {parsed.tag}
                      </span>
                    )}
                    <p className="text-sm text-main leading-relaxed">
                      {parsed.text}
                    </p>

                    {/* Media if present */}
                    {parsed.imageUrl && (
                      <div className="mt-3 rounded border border-line overflow-hidden max-h-56 bg-base">
                        <img
                          src={parsed.imageUrl}
                          alt="Stream attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Footer: Stream index & explorer */}
                    <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-[11px] font-mono text-sub">
                      <span>Stream Entry #{post.id}</span>
                      <Link
                        href="/feed"
                        className="text-sub hover:text-gold flex items-center space-x-1"
                      >
                        <span>Tip Author</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>

        {/* Core Protocol Principles */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-line">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-main">
              Engineered for Financial Fidelity
            </h2>
            <p className="mt-2 text-sub text-xs sm:text-sm">
              Social platforms lock value behind advertising networks. X-Mood Stream connects creators and patrons directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-lg bg-surface border border-line space-y-2">
              <div className="w-8 h-8 rounded bg-elevated border border-line flex items-center justify-center text-gold font-mono font-bold text-sm">
                01
              </div>
              <h3 className="font-display font-semibold text-sm text-main">
                Immutable Micro-Publishing
              </h3>
              <p className="text-sub text-xs leading-relaxed">
                Posts are written directly to <code className="text-main font-mono text-[11px]">XMoodStreamCore.sol</code> without centralized hosting intermediaries.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-surface border border-line space-y-2">
              <div className="w-8 h-8 rounded bg-elevated border border-line flex items-center justify-center text-gold font-mono font-bold text-sm">
                02
              </div>
              <h3 className="font-display font-semibold text-sm text-main">
                95% Direct Vault Routing
              </h3>
              <p className="text-sub text-xs leading-relaxed">
                Tipping invokes <code className="text-main font-mono text-[11px]">TipVault.sol</code>, transferring 95% of mUSDT straight to author balance and 5% to treasury.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-surface border border-line space-y-2">
              <div className="w-8 h-8 rounded bg-elevated border border-line flex items-center justify-center text-glacier font-mono font-bold text-sm">
                03
              </div>
              <h3 className="font-display font-semibold text-sm text-main">
                24h Activity Distribution
              </h3>
              <p className="text-sub text-xs leading-relaxed">
                Active creators claim daily $XMS rewards via <code className="text-main font-mono text-[11px]">RewardDistributor.sol</code> based on post volume and tip engagement.
              </p>
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
