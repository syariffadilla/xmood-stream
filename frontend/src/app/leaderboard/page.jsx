'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import TipModal from '../../components/TipModal';
import FaucetModal from '../../components/FaucetModal';
import { usePublicClient, useAccount } from 'wagmi';
import { getContractAddresses } from '../../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import { Trophy, Coins, RefreshCw, ExternalLink, ArrowUpRight, Award, User, ShieldCheck } from 'lucide-react';

export default function LeaderboardPage() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContractAddresses(chain?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [activeTab, setActiveTab] = useState('creators');
  const [creators, setCreators] = useState([]);
  const [tippers, setTippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!publicClient || !contracts.XMoodStreamCore || !contracts.TipVault) return;
    try {
      setLoading(true);

      const totalPostsBig = await publicClient.readContract({
        address: contracts.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'getTotalPosts',
      });
      const totalPosts = Number(totalPostsBig);

      const creatorMap = {};
      const tipperMap = {};

      if (totalPosts > 0) {
        const postPromises = [];
        for (let i = 1; i <= totalPosts; i++) {
          postPromises.push(
            publicClient.readContract({
              address: contracts.XMoodStreamCore,
              abi: CORE_ABI,
              functionName: 'getPost',
              args: [BigInt(i)],
            }).catch(() => null)
          );
        }

        const rawPosts = await Promise.all(postPromises);
        const validPosts = rawPosts.filter(Boolean);

        for (const post of validPosts) {
          const author = post.author.toLowerCase();
          if (!creatorMap[author]) {
            creatorMap[author] = {
              address: post.author,
              postCount: 0,
              latestPostId: Number(post.id),
              tipsReceived: 0,
            };
          }
          creatorMap[author].postCount += 1;
          if (Number(post.id) > creatorMap[author].latestPostId) {
            creatorMap[author].latestPostId = Number(post.id);
          }
        }

        // Fetch tips for creators
        const creatorAddresses = Object.keys(creatorMap);
        await Promise.all(
          creatorAddresses.map(async (addr) => {
            try {
              const tipsBig = await publicClient.readContract({
                address: contracts.TipVault,
                abi: TIP_VAULT_ABI,
                functionName: 'totalTipsReceived',
                args: [creatorMap[addr].address],
              });
              creatorMap[addr].tipsReceived = parseFloat(formatUnits(tipsBig, 6));
            } catch (e) {
              creatorMap[addr].tipsReceived = 0;
            }
          })
        );
      }

      // Query TipSent events for patrons
      try {
        const tipLogs = await publicClient.getLogs({
          address: contracts.TipVault,
          event: {
            type: 'event',
            name: 'TipSent',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: true, name: 'postId', type: 'uint256' },
              { indexed: false, name: 'amount', type: 'uint256' },
            ],
          },
          fromBlock: 0n,
          toBlock: 'latest',
        });

        for (const log of tipLogs) {
          const fromAddr = log.args.from?.toLowerCase();
          if (fromAddr) {
            if (!tipperMap[fromAddr]) {
              tipperMap[fromAddr] = {
                address: log.args.from,
                tipsSent: 0,
                tipCount: 0,
              };
            }
            tipperMap[fromAddr].tipCount += 1;
          }
        }

        const tipperAddresses = Object.keys(tipperMap);
        await Promise.all(
          tipperAddresses.map(async (addr) => {
            try {
              const sentBig = await publicClient.readContract({
                address: contracts.TipVault,
                abi: TIP_VAULT_ABI,
                functionName: 'totalTipsSent',
                args: [tipperMap[addr].address],
              });
              tipperMap[addr].tipsSent = parseFloat(formatUnits(sentBig, 6));
            } catch (e) {
              tipperMap[addr].tipsSent = 0;
            }
          })
        );
      } catch (err) {}

      // Sort creators
      const creatorList = Object.values(creatorMap).sort((a, b) => {
        if (b.tipsReceived !== a.tipsReceived) return b.tipsReceived - a.tipsReceived;
        return b.postCount - a.postCount;
      });

      // Sort patrons
      const tipperList = Object.values(tipperMap).sort((a, b) => {
        if (b.tipsSent !== a.tipsSent) return b.tipsSent - a.tipsSent;
        return b.tipCount - a.tipCount;
      });

      setCreators(creatorList);
      setTippers(tipperList);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [publicClient, contracts.XMoodStreamCore, contracts.TipVault]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 8000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const handleOpenTipFromLeaderboard = (creator) => {
    setSelectedPost({
      id: creator.latestPostId || 1,
      author: creator.address,
    });
    setIsTipOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base text-main selection:bg-gold selection:text-base">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Telemetry */}
        <div className="flex items-center justify-between pb-6 border-b border-line">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-main">
              Protocol Leaderboard
            </h1>
            <p className="text-sub text-xs mt-0.5">
              Verified ranking based on on-chain settlements on <span className="font-mono text-main">{contracts.chainName}</span>
            </p>
          </div>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchLeaderboard();
            }}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-surface hover:bg-elevated border border-line text-sub hover:text-main transition-colors flex items-center space-x-1.5 text-xs font-mono"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex items-center space-x-2 border-b border-line pb-3">
          <button
            onClick={() => setActiveTab('creators')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'creators'
                ? 'bg-surface text-main font-semibold border border-line'
                : 'text-sub hover:text-main'
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${activeTab === 'creators' ? 'text-gold' : 'text-sub'}`} />
            <span>Top Creators ({creators.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tippers')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'tippers'
                ? 'bg-surface text-main font-semibold border border-line'
                : 'text-sub hover:text-main'
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${activeTab === 'tippers' ? 'text-gold' : 'text-sub'}`} />
            <span>Top Patrons ({tippers.length})</span>
          </button>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="mt-4">
          {loading ? (
            <div className="p-12 rounded-xl bg-surface border border-line text-center text-sub font-mono text-xs">
              Calculating rankings from on-chain transactions...
            </div>
          ) : activeTab === 'creators' ? (
            creators.length === 0 ? (
              <div className="p-12 rounded-xl bg-surface border border-line text-center space-y-3">
                <p className="text-main font-semibold text-sm">No creator activity recorded yet.</p>
                <p className="text-sub text-xs max-w-sm mx-auto">
                  Publish a post to register your wallet address on the on-chain leaderboard.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs transition-colors"
                >
                  Broadcast Post
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {creators.map((creator, index) => {
                  const isUser = address && creator.address.toLowerCase() === address.toLowerCase();
                  return (
                    <div
                      key={creator.address}
                      className={`p-4 rounded-xl bg-surface border transition-colors flex items-center justify-between gap-4 ${
                        isUser ? 'border-gold/50 bg-surface' : 'border-line hover:border-sub/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          index === 0
                            ? 'bg-gold text-base'
                            : index === 1
                            ? 'bg-elevated border border-line text-main'
                            : index === 2
                            ? 'bg-elevated border border-line text-sub'
                            : 'text-sub'
                        }`}>
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`${contracts.explorer}/address/${creator.address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs font-semibold text-main hover:text-gold flex items-center space-x-1"
                            >
                              <span>{creator.address.slice(0, 6)}...{creator.address.slice(-4)}</span>
                              <ExternalLink className="w-3 h-3 text-sub" />
                            </a>
                            {isUser && (
                              <span className="px-1.5 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-mono font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-sub mt-0.5">
                            {creator.postCount} {creator.postCount === 1 ? 'broadcast' : 'broadcasts'} published
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-right">
                        <div>
                          <div className="text-xs font-mono font-bold text-gold">
                            +{creator.tipsReceived.toFixed(2)} USDT
                          </div>
                          <div className="text-[10px] font-mono text-sub">
                            Tips Earned (95%)
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenTipFromLeaderboard(creator)}
                          className="hidden sm:flex px-3 py-1.5 rounded-lg bg-elevated hover:bg-gold hover:text-base border border-line text-main text-xs font-mono transition-colors items-center space-x-1"
                        >
                          <span>Tip</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            tippers.length === 0 ? (
              <div className="p-12 rounded-xl bg-surface border border-line text-center space-y-3">
                <p className="text-main font-semibold text-sm">No patron tips recorded yet.</p>
                <p className="text-sub text-xs max-w-sm mx-auto">
                  Tip a creator on the stream feed to appear on the patron leaderboard.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tippers.map((tipper, index) => {
                  const isUser = address && tipper.address.toLowerCase() === address.toLowerCase();
                  return (
                    <div
                      key={tipper.address}
                      className={`p-4 rounded-xl bg-surface border transition-colors flex items-center justify-between gap-4 ${
                        isUser ? 'border-gold/50 bg-surface' : 'border-line hover:border-sub/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          index === 0
                            ? 'bg-gold text-base'
                            : index === 1
                            ? 'bg-elevated border border-line text-main'
                            : 'text-sub'
                        }`}>
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`${contracts.explorer}/address/${tipper.address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs font-semibold text-main hover:text-gold flex items-center space-x-1"
                            >
                              <span>{tipper.address.slice(0, 6)}...{tipper.address.slice(-4)}</span>
                              <ExternalLink className="w-3 h-3 text-sub" />
                            </a>
                            {isUser && (
                              <span className="px-1.5 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-mono font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-sub mt-0.5">
                            {tipper.tipCount} {tipper.tipCount === 1 ? 'tip transfer' : 'tip transfers'} executed
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-glacier">
                          {tipper.tipsSent.toFixed(2)} USDT
                        </div>
                        <div className="text-[10px] font-mono text-sub">
                          Total Tipped
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          fetchLeaderboard();
        }}
      />

      <TipModal
        isOpen={isTipOpen}
        onClose={() => {
          setIsTipOpen(false);
          fetchLeaderboard();
        }}
        post={selectedPost}
      />

      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
