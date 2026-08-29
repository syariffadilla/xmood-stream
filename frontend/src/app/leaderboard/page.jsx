'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import FaucetModal from '../../components/FaucetModal';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, getContractAddresses } from '../../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import { Trophy, Crown, Heart, RefreshCw, User, Award, ArrowUpRight, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('creators');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [topCreators, setTopCreators] = useState([]);
  const [topTippers, setTopTippers] = useState([]);

  const publicClient = usePublicClient();
  const { chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);

  const fetchLeaderboardData = useCallback(async (showToast = false) => {
    if (!publicClient) return;
    setLoading(true);
    try {
      // 1. Fetch total posts
      const totalPosts = await publicClient.readContract({
        address: contracts.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'getTotalPosts',
      });

      const count = Number(totalPosts);
      const creatorMap = {};
      const tipperMap = {};

      // 2. Fetch all posts in parallel
      const postIndices = [];
      for (let i = 1; i <= Math.min(count, 100); i++) {
        postIndices.push(i);
      }

      const posts = await Promise.all(
        postIndices.map(async (i) => {
          try {
            return await publicClient.readContract({
              address: contracts.XMoodStreamCore,
              abi: CORE_ABI,
              functionName: 'getPost',
              args: [BigInt(i)],
            });
          } catch (e) {
            return null;
          }
        })
      );

      // 3. Aggregate creators from on-chain posts
      const uniqueAuthors = new Set();
      for (const post of posts) {
        if (!post || !post.author) continue;
        const authorLower = post.author.toLowerCase();
        uniqueAuthors.add(post.author);
        if (!creatorMap[authorLower]) {
          creatorMap[authorLower] = {
            address: post.author,
            tipsReceived: 0,
            postCount: 1,
          };
        } else {
          creatorMap[authorLower].postCount += 1;
        }
      }

      // Fetch on-chain total tips received for each creator
      await Promise.all(
        Array.from(uniqueAuthors).map(async (authorAddr) => {
          const authorLower = authorAddr.toLowerCase();
          try {
            const tipsRaw = await publicClient.readContract({
              address: contracts.TipVault,
              abi: TIP_VAULT_ABI,
              functionName: 'totalTipsReceived',
              args: [authorAddr],
            });
            if (creatorMap[authorLower]) {
              creatorMap[authorLower].tipsReceived = parseFloat(formatUnits(tipsRaw, 6));
            }
          } catch (e) {
            console.warn(`Error reading tips for creator ${authorAddr}:`, e);
          }
        })
      );

      // 4. Discover on-chain tippers via TipSent event logs
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
        });

        const uniqueTippers = new Set();
        for (const log of tipLogs) {
          const from = log.args?.from;
          if (!from) continue;
          const fromLower = from.toLowerCase();
          uniqueTippers.add(from);
          if (!tipperMap[fromLower]) {
            tipperMap[fromLower] = {
              address: from,
              tipsSent: 0,
              tipsCount: 1,
            };
          } else {
            tipperMap[fromLower].tipsCount += 1;
          }
        }

        // Query accurate totalTipsSent for each tipper
        await Promise.all(
          Array.from(uniqueTippers).map(async (tipperAddr) => {
            const tipperLower = tipperAddr.toLowerCase();
            try {
              const tipsSentRaw = await publicClient.readContract({
                address: contracts.TipVault,
                abi: TIP_VAULT_ABI,
                functionName: 'totalTipsSent',
                args: [tipperAddr],
              });
              if (tipperMap[tipperLower]) {
                tipperMap[tipperLower].tipsSent = parseFloat(formatUnits(tipsSentRaw, 6));
              }
            } catch (e) {
              console.warn(`Error reading tips sent for ${tipperAddr}:`, e);
            }
          })
        );
      } catch (logErr) {
        console.warn('TipSent getLogs skipped or unsupported:', logErr);
      }

      const creatorsList = Object.values(creatorMap).sort((a, b) => {
        if (b.tipsReceived !== a.tipsReceived) return b.tipsReceived - a.tipsReceived;
        return b.postCount - a.postCount;
      });

      const tippersList = Object.values(tipperMap).sort((a, b) => {
        if (b.tipsSent !== a.tipsSent) return b.tipsSent - a.tipsSent;
        return b.tipsCount - a.tipsCount;
      });

      setTopCreators(creatorsList);
      setTopTippers(tippersList);

      if (showToast) {
        toast.success(`Leaderboard synced: ${creatorsList.length} creators, ${tippersList.length} tippers!`);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      if (showToast) toast.error('Failed to sync leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [publicClient, contracts.XMoodStreamCore, contracts.TipVault]);

  useEffect(() => {
    fetchLeaderboardData(false);
  }, [fetchLeaderboardData]);

  const activeList = activeTab === 'creators' ? topCreators : topTippers;

  return (
    <div className="min-h-screen flex flex-col bg-[#090C15] text-[#F3F4F6]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E131F] border border-[#1E293B] p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-[#F59E0B]" />
              <h1 className="font-grotesk font-bold text-2xl text-[#F3F4F6]">
                SocialFi Leaderboard
              </h1>
            </div>
            <p className="text-xs font-mono text-[#94A3B8] mt-1">
              Top Creators by USDT earned & Top Patrons by USDT tipped on {contracts.chainName}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#090C15] border border-[#1E293B] p-1 rounded-xl flex items-center space-x-1 font-mono text-xs">
              <button
                onClick={() => setActiveTab('creators')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'creators'
                    ? 'bg-[#182032] text-[#00F5A0] font-bold shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F3F4F6]'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Top Creators</span>
              </button>

              <button
                onClick={() => setActiveTab('tippers')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'tippers'
                    ? 'bg-[#182032] text-[#F59E0B] font-bold shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F3F4F6]'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Top Tippers</span>
              </button>
            </div>

            <button
              onClick={() => fetchLeaderboardData(true)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#090C15] border border-[#1E293B] hover:border-[#00F5A0]/50 text-[#94A3B8] hover:text-[#00F5A0] transition-colors"
              title="Refresh ranking"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00F5A0]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Podium Top 3 Cards (If data exists) */}
        {activeList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeList.slice(0, 3).map((item, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;

              return (
                <div
                  key={item.address}
                  className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
                    isFirst
                      ? 'bg-gradient-to-br from-[#0E131F] via-[#111726] to-[#090C15] border-[#F59E0B]/50 shadow-xl shadow-[#F59E0B]/10 order-1 md:order-2 md:-translate-y-2'
                      : isSecond
                      ? 'bg-[#0E131F] border-[#1E293B] order-2 md:order-1'
                      : 'bg-[#0E131F] border-[#1E293B] order-3'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                        isFirst
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                          : isSecond
                          ? 'bg-[#94A3B8]/20 text-[#94A3B8] border border-[#94A3B8]/40'
                          : 'bg-[#B45309]/20 text-[#B45309] border border-[#B45309]/40'
                      }`}
                    >
                      #{rank}
                    </div>
                    <span className="text-xs font-mono text-[#94A3B8]">
                      {activeTab === 'creators' ? `${item.postCount || 1} Streams` : `${item.tipsCount || 1} Tips`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-mono text-sm font-bold text-[#F3F4F6]">
                      {item.address.slice(0, 6)}...{item.address.slice(-4)}
                    </div>
                    <div className="text-xs font-mono text-[#94A3B8]">
                      {activeTab === 'creators' ? 'Total Tips Earned' : 'Total Tips Sent'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-baseline space-x-2">
                    <span className="font-mono text-2xl font-extrabold text-[#F59E0B]">
                      {activeTab === 'creators' ? item.tipsReceived.toFixed(2) : item.tipsSent.toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-[#94A3B8]">USDT</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Table Leaderboard / Empty State */}
        <div className="bg-[#0E131F] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
            <h3 className="font-grotesk font-bold text-sm text-[#F3F4F6]">
              {activeTab === 'creators' ? 'Creator Ranking Ledger' : 'Top Tipper Ranking Ledger'}
            </h3>
            <span className="text-xs font-mono text-[#94A3B8]">
              {activeList.length} Verified Participants
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-mono text-[#94A3B8] space-y-2">
              <div className="w-6 h-6 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Scanning blockchain for rankings...</p>
            </div>
          ) : activeList.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <Layers className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              <p className="font-grotesk font-semibold text-sm text-[#F3F4F6]">
                {activeTab === 'creators'
                  ? 'No creators ranked on this network yet'
                  : 'No tip transactions recorded on this network yet'}
              </p>
              <p className="text-xs font-mono text-[#94A3B8] max-w-sm mx-auto">
                {activeTab === 'creators'
                  ? 'Be the first creator to broadcast a stream on XMoodStreamCore and earn USDT tips!'
                  : 'Send a USDT tip to any creator post on the Live Feed to appear on the Patron leaderboard!'}
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00F5A0] hover:bg-[#00F5A0]/90 text-[#090C15] font-grotesk font-bold text-xs uppercase transition-all mt-2"
              >
                Broadcast Stream
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#1E293B]">
              {activeList.map((item, idx) => (
                <div
                  key={item.address}
                  className="px-6 py-4 flex items-center justify-between hover:bg-[#182032]/40 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-6 text-center font-bold text-[#94A3B8]">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#090C15] border border-[#1E293B] flex items-center justify-center font-bold text-[#00F5A0]">
                      {item.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[#F3F4F6]">
                        {item.address}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {activeTab === 'creators' ? `${item.postCount || 1} on-chain micro-posts` : `${item.tipsCount || 1} creator tip transactions`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#F59E0B] text-sm">
                      +{activeTab === 'creators' ? item.tipsReceived.toFixed(2) : item.tipsSent.toFixed(2)} USDT
                    </div>
                    <div className="text-[11px] text-[#00F5A0]">
                      Verified on {contracts.chainName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={() => {
          setTimeout(() => {
            fetchLeaderboardData(false);
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
