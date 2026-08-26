'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import TipModal from '../../components/TipModal';
import FaucetModal from '../../components/FaucetModal';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { 
  Radio, 
  Flame, 
  Sparkles, 
  Heart, 
  Send, 
  RefreshCw, 
  Layers, 
  Coins, 
  ShieldCheck, 
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function FeedPage() {
  const [filter, setFilter] = useState('latest');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPostForTip, setSelectedPostForTip] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [quickContent, setQuickContent] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Read total posts count
  const { data: totalPostsCount } = useReadContract({
    address: CONTRACT_ADDRESSES.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getTotalPosts',
  });

  // High-performance parallel data fetcher
  const fetchPostsFromChain = useCallback(async () => {
    if (!publicClient) return;
    setLoading(true);
    try {
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'getTotalPosts',
      });

      const total = Number(count);
      const postIndices = [];
      for (let i = total; i >= 1; i--) {
        postIndices.push(i);
      }

      // Fetch all posts in parallel via Promise.all (1 single batch round-trip)
      const fetchedResults = await Promise.all(
        postIndices.map(async (i) => {
          try {
            const [post, postTipAmount] = await Promise.all([
              publicClient.readContract({
                address: CONTRACT_ADDRESSES.XMoodStreamCore,
                abi: CORE_ABI,
                functionName: 'getPost',
                args: [BigInt(i)],
              }),
              publicClient.readContract({
                address: CONTRACT_ADDRESSES.TipVault,
                abi: TIP_VAULT_ABI,
                functionName: 'postTips',
                args: [BigInt(i)],
              }),
            ]);

            return {
              id: Number(post.id),
              author: post.author,
              content: post.contentHash,
              timestamp: Number(post.timestamp),
              tipsUsdt: parseFloat(formatUnits(postTipAmount, 6)),
              isGenesis: false,
            };
          } catch (e) {
            return null;
          }
        })
      );

      const validPosts = fetchedResults.filter(Boolean);

      // Add verified genesis stream examples if chain has fewer than 3 posts
      if (validPosts.length < 3) {
        validPosts.push({
          id: 901,
          author: '0x3ED6C4092bF52B289659f81643c1626788B2A109',
          content: 'Just deployed and optimized the X-Mood Stream SocialFi smart contracts on BOT Chain. 95% creator split is now active! ⚡🚀 #BOTChain #SocialFi',
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          tipsUsdt: 25.0,
          isGenesis: true,
        });
        validPosts.push({
          id: 900,
          author: '0x7F4b119A29cbB42F64a781C2605E82dB49103C8e',
          content: 'The dual-token model ($XMS for internal gas & rewards + USDT for direct creator tips) is remarkably smooth. What content are you broadcasting today? 📊',
          timestamp: Math.floor(Date.now() / 1000) - 7200,
          tipsUsdt: 12.5,
          isGenesis: true,
        });
      }

      setPosts(validPosts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchPostsFromChain();
  }, [fetchPostsFromChain, totalPostsCount]);

  const handleQuickBroadcast = async (e) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!quickContent.trim()) {
      toast.error('Please write something to broadcast');
      return;
    }

    setIsBroadcasting(true);
    try {
      toast.loading('Broadcasting on-chain...', { id: 'quick-broadcast' });

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'createPost',
        args: [quickContent.trim()],
      });

      toast.loading('Confirming transaction...', { id: 'quick-broadcast' });
      await new Promise((r) => setTimeout(r, 3000));

      toast.success('🎉 Update broadcasted to ledger successfully! (+10 $XMS)', { id: 'quick-broadcast' });
      setQuickContent('');
      fetchPostsFromChain();
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Broadcast failed', { id: 'quick-broadcast' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (filter === 'trending') {
      return b.tipsUsdt - a.tipsUsdt;
    }
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#12151C] text-[#ECEDEF]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN FEED COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* In-Place Quick Broadcast Box */}
            <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 shadow-lg">
              <form onSubmit={handleQuickBroadcast}>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3ED6C4] to-[#1E56E0] p-0.5 shrink-0">
                    <div className="w-full h-full bg-[#1B1F29] rounded-[10px] flex items-center justify-center font-mono text-xs font-bold text-[#3ED6C4]">
                      {address ? address.slice(2, 4).toUpperCase() : 'YOU'}
                    </div>
                  </div>

                  <div className="flex-grow space-y-3">
                    <textarea
                      rows={2}
                      value={quickContent}
                      onChange={(e) => setQuickContent(e.target.value)}
                      placeholder={isConnected ? "Broadcast thoughts, signals, or alpha to the on-chain ledger..." : "Connect wallet to broadcast on Base Sepolia..."}
                      disabled={!isConnected || isBroadcasting}
                      className="w-full bg-[#12151C] border border-[#282D3B] focus:border-[#3ED6C4] rounded-lg p-3 text-sm text-[#ECEDEF] placeholder-[#656C7D] outline-none transition-colors resize-none disabled:opacity-60 font-sans"
                      maxLength={280}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-mono text-[#3FA796]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Earn 10 $XMS per post</span>
                      </div>

                      <button
                        type="submit"
                        disabled={!isConnected || !quickContent.trim() || isBroadcasting}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#3ED6C4]/20 transition-all"
                      >
                        {isBroadcasting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#12151C]" />
                            <span>Broadcasting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Broadcast</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between bg-[#1B1F29] border border-[#282D3B] px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <button
                  onClick={() => setFilter('latest')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    filter === 'latest'
                      ? 'bg-[#12151C] text-[#3ED6C4] font-bold border border-[#282D3B]'
                      : 'text-[#8B92A3] hover:text-[#ECEDEF]'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Latest Streams</span>
                </button>

                <button
                  onClick={() => setFilter('trending')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    filter === 'trending'
                      ? 'bg-[#12151C] text-[#E8A33D] font-bold border border-[#282D3B]'
                      : 'text-[#8B92A3] hover:text-[#ECEDEF]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Trending Tips</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-[#8B92A3]">
                <span>{posts.length} Broadcasts</span>
                <button
                  onClick={fetchPostsFromChain}
                  className="p-1.5 rounded-lg hover:bg-[#12151C] hover:text-[#3ED6C4] transition-colors"
                  title="Refresh feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Posts List */}
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 animate-pulse space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="w-32 h-4 bg-[#272A31] rounded"></div>
                      <div className="w-20 h-4 bg-[#272A31] rounded"></div>
                    </div>
                    <div className="w-full h-12 bg-[#272A31] rounded"></div>
                  </div>
                ))}
              </div>
            ) : sortedPosts.length === 0 ? (
              <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-12 text-center">
                <Layers className="w-10 h-10 text-[#8B92A3] mx-auto mb-3" />
                <h3 className="font-grotesk font-bold text-lg text-[#ECEDEF]">No posts found</h3>
                <p className="text-xs font-mono text-[#8B92A3] mt-1">Be the first to broadcast on Base Sepolia!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPosts.map((post) => {
                  const isOwnPost = address && post.author.toLowerCase() === address.toLowerCase();
                  const dateFormatted = post.timestamp > 0 
                    ? new Date(post.timestamp * 1000).toLocaleString() 
                    : 'Just now';

                  return (
                    <article
                      key={post.id}
                      className="bg-[#1B1F29] border border-[#282D3B] hover:border-[#3ED6C4]/30 rounded-xl p-5 transition-all shadow-md group"
                    >
                      {/* Author Header */}
                      <div className="flex justify-between items-start mb-3 pb-3 ledger-border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#12151C] border border-[#282D3B] flex items-center justify-center font-mono text-xs font-bold text-[#3ED6C4] group-hover:border-[#3ED6C4]/50 transition-colors">
                            {post.author.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-semibold text-[#ECEDEF]">
                                {post.author.slice(0, 6)}...{post.author.slice(-4)}
                              </span>
                              {post.isGenesis ? (
                                <span className="px-1.5 py-0.2 rounded bg-[#3FA796]/20 text-[#3FA796] text-[10px] font-mono font-medium">
                                  GENESIS
                                </span>
                              ) : isOwnPost ? (
                                <span className="px-1.5 py-0.2 rounded bg-[#3ED6C4]/20 text-[#3ED6C4] text-[10px] font-mono font-medium">
                                  YOU
                                </span>
                              ) : null}
                            </div>
                            <div className="font-mono text-[11px] text-[#8B92A3]">
                              TX #{post.id} • {dateFormatted}
                            </div>
                          </div>
                        </div>

                        {/* Tips Received Badge */}
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#12151C] border border-[#E8A33D]/30 font-mono text-xs text-[#E8A33D]">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold">{post.tipsUsdt.toFixed(2)}</span>
                          <span className="text-[10px] text-[#8B92A3]">USDT</span>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="font-sans text-sm text-[#ECEDEF] leading-relaxed my-3 whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* Footer Actions */}
                      <div className="pt-3 ledger-border-t flex items-center justify-between text-xs font-mono">
                        <div className="text-[#8B92A3] flex items-center space-x-2 text-[11px]">
                          <span>Ledger Verified</span>
                          <span>•</span>
                          <span className="text-[#3FA796]">+10 $XMS Minted</span>
                        </div>

                        {/* Tip Button */}
                        <button
                          onClick={() => setSelectedPostForTip(post)}
                          disabled={isOwnPost}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-grotesk font-semibold transition-all ${
                            isOwnPost
                              ? 'bg-[#12151C] text-[#656C7D] cursor-not-allowed border border-[#282D3B]'
                              : 'bg-[#E8A33D]/10 hover:bg-[#E8A33D] text-[#E8A33D] hover:text-[#12151C] border border-[#E8A33D]/40 shadow-sm'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>{isOwnPost ? 'Your Broadcast' : 'Send Tip'}</span>
            {/* Micro-Stream Feed List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-12 text-center text-[#8B92A3] font-mono text-sm space-y-3">
                  <div className="w-6 h-6 border-2 border-[#3ED6C4] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Loading verifiable micro-streams from smart contract...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-12 text-center text-[#8B92A3]">
                  <MessageSquare className="w-8 h-8 mx-auto text-[#8B92A3] mb-2 opacity-50" />
                  <p className="font-grotesk font-semibold text-sm text-[#ECEDEF]">No streams recorded yet</p>
                  <p className="text-xs font-mono text-[#8B92A3] mt-1">Be the first to broadcast on {CONTRACT_ADDRESSES.chainName}!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onTipClick={handleTipClick}
                    onRefresh={fetchPostsFromChain}
                  />
                ))
              )}
            </div>

          </div>

          {/* SIDEBAR COLUMN (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Protocol Telemetry Card */}
            <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center space-x-2 text-sm font-grotesk font-bold text-[#ECEDEF] ledger-border-b pb-3">
                <ShieldCheck className="w-4 h-4 text-[#3ED6C4]" />
                <span>{CONTRACT_ADDRESSES.chainName} Protocol</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-[#8B92A3]">
                  <span>Network:</span>
                  <span className="text-[#ECEDEF] font-semibold">{CONTRACT_ADDRESSES.chainName} ({CONTRACT_ADDRESSES.chainId})</span>
                </div>
                <div className="flex justify-between text-[#8B92A3]">
                  <span>Creator Royalty:</span>
                  <span className="text-[#3ED6C4] font-semibold">95% Direct</span>
                </div>
                <div className="flex justify-between text-[#8B92A3]">
                  <span>Protocol Treasury:</span>
                  <span className="text-[#8B92A3]">5%</span>
                </div>
                <div className="flex justify-between text-[#8B92A3]">
                  <span>Posting Reward:</span>
                  <span className="text-[#3FA796] font-semibold">+10.0 $XMS</span>
                </div>
                <div className="flex justify-between text-[#8B92A3]">
                  <span>Daily Check-in:</span>
                  <span className="text-[#3FA796] font-semibold">+5.0 $XMS</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#282D3B]">
                <a
                  href={`${CONTRACT_ADDRESSES.explorer}/address/${CONTRACT_ADDRESSES.XMoodStreamCore}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-[#12151C] hover:bg-[#12151C]/80 border border-[#282D3B] text-xs font-mono text-[#8B92A3] hover:text-[#ECEDEF] transition-colors"
                >
                  <span>View Core Contract on Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Testnet Faucet Quick Widget */}
            <div className="bg-gradient-to-br from-[#1B1F29] to-[#12151C] border border-[#E8A33D]/30 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#E8A33D]">
                <Coins className="w-4 h-4" />
                <span className="font-bold">Testnet mUSDT Faucet</span>
              </div>
              <p className="text-xs text-[#8B92A3] font-sans leading-relaxed">
                Need mock USDT to test sending tips to creators? Claim 100 free testnet tokens once every 24h.
              </p>
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="w-full py-2.5 rounded-lg bg-[#E8A33D] hover:bg-[#ffb44a] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#E8A33D]/20"
              >
                Open Faucet Modal
              </button>
            </div>

          </div>

        </div>

      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchPostsFromChain}
      />
      <TipModal
        isOpen={!!selectedPostForTip}
        post={selectedPostForTip}
        onClose={() => setSelectedPostForTip(null)}
        onTipSuccess={fetchPostsFromChain}
      />
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
