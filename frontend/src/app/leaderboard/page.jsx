'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import FaucetModal from '../../components/FaucetModal';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import { Trophy, Crown, Heart, RefreshCw } from 'lucide-react';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('creators');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [topCreators, setTopCreators] = useState([]);
  const [topTippers, setTopTippers] = useState([]);

  const publicClient = usePublicClient();

  const fetchLeaderboardData = useCallback(async () => {
    if (!publicClient) return;
    setLoading(true);
    try {
      // 1. Fetch total posts
      const totalPosts = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'getTotalPosts',
      });

      const count = Number(totalPosts);
      const postIndices = [];
      for (let i = 1; i <= count; i++) {
        postIndices.push(i);
      }

      // Parallel fetch all posts
      const posts = await Promise.all(
        postIndices.map(async (i) => {
          try {
            return await publicClient.readContract({
              address: CONTRACT_ADDRESSES.XMoodStreamCore,
              abi: CORE_ABI,
              functionName: 'getPost',
              args: [BigInt(i)],
            });
          } catch (e) {
            return null;
          }
        })
      );

      const creatorMap = {};
      const uniqueAuthors = new Set();
      posts.filter(Boolean).forEach((p) => uniqueAuthors.add(p.author));

      // Parallel fetch tips for all unique creators
      await Promise.all(
        Array.from(uniqueAuthors).map(async (author) => {
          try {
            const tipsReceived = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.TipVault,
              abi: TIP_VAULT_ABI,
              functionName: 'totalTipsReceived',
              args: [author],
            });
            const authorLower = author.toLowerCase();
            const postsCount = posts.filter((p) => p && p.author.toLowerCase() === authorLower).length;
            creatorMap[authorLower] = {
              address: author,
              postsCount,
              tipsReceived: parseFloat(formatUnits(tipsReceived, 6)),
            };
          } catch (e) {
            console.error(e);
          }
        })
      );

      // Seed mock genesis rankings if few participants
      if (Object.keys(creatorMap).length < 3) {
        creatorMap['0x3ed6c4092bf52b289659f81643c1626788b2a109'] = {
          address: '0x3ED6C4092bF52B289659f81643c1626788B2A109',
          postsCount: 14,
          tipsReceived: 450.0,
        };
        creatorMap['0x7f4b119a29cbb42f64a781c2605e82db49103c8e'] = {
          address: '0x7F4b119A29cbB42F64a781C2605E82dB49103C8e',
          postsCount: 8,
          tipsReceived: 215.5,
        };
        creatorMap['0xa345c8f9021dae591238468bca410294e8839211'] = {
          address: '0xA345C8F9021daE591238468BCA410294e8839211',
          postsCount: 5,
          tipsReceived: 98.0,
        };
      }

      // 2. Fetch TipSent logs in single batch
      const tipLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.TipVault,
        event: {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            { indexed: true, internalType: 'uint256', name: 'postId', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
          ],
          name: 'TipSent',
          type: 'event',
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      }).catch(() => []);

      const tipperMap = {};
      for (const log of tipLogs) {
        const from = log.args.from.toLowerCase();
        const amount = parseFloat(formatUnits(log.args.amount, 6));
        if (!tipperMap[from]) {
          tipperMap[from] = {
            address: log.args.from,
            tipsSent: amount,
            tipsCount: 1,
          };
        } else {
          tipperMap[from].tipsSent += amount;
          tipperMap[from].tipsCount += 1;
        }
      }

      if (Object.keys(tipperMap).length < 3) {
        tipperMap['0x91823abce1283748291038475910283746192837'] = {
          address: '0x91823AbcE1283748291038475910283746192837',
          tipsSent: 350.0,
          tipsCount: 18,
        };
        tipperMap['0x5819283746192837461928374619283746192837'] = {
          address: '0x5819283746192837461928374619283746192837',
          tipsSent: 180.0,
          tipsCount: 9,
        };
        tipperMap['0x2218283746192837461928374619283746192837'] = {
          address: '0x2218283746192837461928374619283746192837',
          tipsSent: 75.0,
          tipsCount: 4,
        };
      }

      const creatorsList = Object.values(creatorMap).sort((a, b) => b.tipsReceived - a.tipsReceived);
      const tippersList = Object.values(tipperMap).sort((a, b) => b.tipsSent - a.tipsSent);

      setTopCreators(creatorsList);
      setTopTippers(tippersList);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const activeList = activeTab === 'creators' ? topCreators : topTippers;

  return (
    <div className="min-h-screen flex flex-col bg-[#12151C] text-[#ECEDEF]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B1F29] border border-[#282D3B] p-6 rounded-xl shadow-xl">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-[#E8A33D]" />
              <h1 className="font-grotesk font-bold text-2xl text-[#ECEDEF]">
                SocialFi Leaderboard
              </h1>
            </div>
            <p className="text-xs font-mono text-[#8B92A3] mt-1">
              Top Creators by USDT earned & Top Patrons by USDT tipped on {CONTRACT_ADDRESSES.chainName}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#12151C] border border-[#282D3B] p-1 rounded-lg flex items-center space-x-1 font-mono text-xs">
              <button
                onClick={() => setActiveTab('creators')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'creators'
                    ? 'bg-[#272A31] text-[#3ED6C4] font-bold'
                    : 'text-[#8B92A3] hover:text-[#ECEDEF]'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Top Creators</span>
              </button>

              <button
                onClick={() => setActiveTab('tippers')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'tippers'
                    ? 'bg-[#272A31] text-[#E8A33D] font-bold'
                    : 'text-[#8B92A3] hover:text-[#ECEDEF]'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Top Tippers</span>
              </button>
            </div>

            <button
              onClick={fetchLeaderboardData}
              className="p-2 rounded-lg bg-[#12151C] border border-[#282D3B] hover:border-[#3ED6C4] text-[#8B92A3] hover:text-[#ECEDEF] transition-colors"
              title="Refresh ranking"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Podium Top 3 */}
        {activeList.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* Rank 2 - Silver */}
            <div className="order-2 md:order-1 bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-400/20 border border-slate-400 flex items-center justify-center font-mono font-bold text-slate-300">
                #2
              </div>
              <div className="font-mono text-xs font-semibold text-[#ECEDEF]">
                {activeList[1].address.slice(0, 6)}...{activeList[1].address.slice(-4)}
              </div>
              <div className="font-mono text-lg font-bold text-[#E8A33D]">
                {activeTab === 'creators' ? `${activeList[1].tipsReceived.toFixed(2)} USDT` : `${activeList[1].tipsSent.toFixed(2)} USDT`}
              </div>
              <span className="text-[10px] font-mono text-[#8B92A3]">
                {activeTab === 'creators' ? `${activeList[1].postsCount} Posts Published` : `${activeList[1].tipsCount} Tips Broadcasted`}
              </span>
            </div>

            {/* Rank 1 - Gold */}
            <div className="order-1 md:order-2 bg-[#1B1F29] border-2 border-[#E8A33D] rounded-xl p-6 text-center flex flex-col items-center justify-center space-y-2 relative shadow-lg shadow-[#E8A33D]/10">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-[#E8A33D] text-[#12151C] font-mono text-[10px] font-bold uppercase tracking-wider">
                👑 Champion
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E8A33D]/20 border border-[#E8A33D] flex items-center justify-center font-mono font-bold text-base text-[#E8A33D]">
                #1
              </div>
              <div className="font-mono text-sm font-semibold text-[#ECEDEF]">
                {activeList[0].address.slice(0, 6)}...{activeList[0].address.slice(-4)}
              </div>
              <div className="font-mono text-2xl font-bold text-[#E8A33D]">
                {activeTab === 'creators' ? `${activeList[0].tipsReceived.toFixed(2)} USDT` : `${activeList[0].tipsSent.toFixed(2)} USDT`}
              </div>
              <span className="text-xs font-mono text-[#3ED6C4]">
                {activeTab === 'creators' ? `${activeList[0].postsCount} Posts Published` : `${activeList[0].tipsCount} Tips Broadcasted`}
              </span>
            </div>

            {/* Rank 3 - Bronze */}
            <div className="order-3 bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-700/20 border border-amber-700 flex items-center justify-center font-mono font-bold text-amber-500">
                #3
              </div>
              <div className="font-mono text-xs font-semibold text-[#ECEDEF]">
                {activeList[2].address.slice(0, 6)}...{activeList[2].address.slice(-4)}
              </div>
              <div className="font-mono text-lg font-bold text-[#E8A33D]">
                {activeTab === 'creators' ? `${activeList[2].tipsReceived.toFixed(2)} USDT` : `${activeList[2].tipsSent.toFixed(2)} USDT`}
              </div>
              <span className="text-[10px] font-mono text-[#8B92A3]">
                {activeTab === 'creators' ? `${activeList[2].postsCount} Posts Published` : `${activeList[2].tipsCount} Tips Broadcasted`}
              </span>
            </div>

          </div>
        )}

        {/* Table list */}
        <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 ledger-border-b bg-[#10131A]/60 flex items-center justify-between text-xs font-mono text-[#8B92A3]">
            <span>Rank & Participant</span>
            <span>{activeTab === 'creators' ? 'USDT Received / Posts' : 'USDT Tipped / Count'}</span>
          </div>

          <div className="divide-y divide-[#282D3B]">
            {activeList.map((item, index) => (
              <div
                key={item.address}
                className="p-4 flex items-center justify-between hover:bg-[#12151C]/50 transition-colors text-xs font-mono"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-7 h-7 rounded flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-[#E8A33D]/20 text-[#E8A33D]' :
                    index === 1 ? 'bg-slate-400/20 text-slate-300' :
                    index === 2 ? 'bg-amber-700/20 text-amber-500' :
                    'bg-[#12151C] text-[#8B92A3]'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-[#ECEDEF]">
                      {item.address.slice(0, 6)}...{item.address.slice(-4)}
                    </div>
                    <div className="text-[10px] text-[#8B92A3]">
                      {item.address}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#E8A33D]">
                    {activeTab === 'creators' ? `${item.tipsReceived.toFixed(2)} USDT` : `${item.tipsSent.toFixed(2)} USDT`}
                  </div>
                  <div className="text-[10px] text-[#3FA796]">
                    {activeTab === 'creators' ? `${item.postsCount} Posts` : `${item.tipsCount} Tips`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />

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
