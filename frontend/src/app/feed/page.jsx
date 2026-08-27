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
  Loader2,
  Image as ImageIcon,
  MessageSquarePlus,
  Share2,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: '⚡ All Streams' },
  { id: '#Alpha', label: '🚀 Alpha' },
  { id: '#DePIN', label: '🤖 DePIN & AI' },
  { id: '#DeFi', label: '📈 DeFi' },
  { id: '#NFT', label: '🎨 NFT & Art' },
  { id: '#Meme', label: '🔥 Memes' },
];

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPostForTip, setSelectedPostForTip] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [quickContent, setQuickContent] = useState('');
  const [quickMedia, setQuickMedia] = useState('');
  const [showQuickMedia, setShowQuickMedia] = useState(false);
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

  // Helper to parse content, tags, and media
  const parsePostData = (rawText) => {
    let cleanText = rawText || '';
    let mediaUrl = null;

    // Check for [media:url] pattern
    const mediaMatch = cleanText.match(/\[media:(.*?)\]/);
    if (mediaMatch) {
      mediaUrl = mediaMatch[1];
      cleanText = cleanText.replace(/\[media:.*?\]/, '').trim();
    }

    return { text: cleanText, mediaUrl };
  };

  // Parallel fetcher
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

            const parsed = parsePostData(post.contentHash);

            return {
              id: Number(post.id),
              author: post.author.toLowerCase(),
              rawContent: post.contentHash,
              content: parsed.text,
              mediaUrl: parsed.mediaUrl,
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

      // Add rich creator demo posts if fewer than 3 posts exist
      if (validPosts.length < 3) {
        validPosts.push({
          id: 902,
          author: '0x34758c708aca45385162348438899580f78dc150',
          rawContent: '#Alpha 🚀 Launching our DePIN AI compute node on BOT Chain! Instant transactions and sub-cent gas fees make creator micro-streaming seamless.',
          content: '#Alpha 🚀 Launching our DePIN AI compute node on BOT Chain! Instant transactions and sub-cent gas fees make creator micro-streaming seamless.',
          mediaUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
          timestamp: Math.floor(Date.now() / 1000) - 1800,
          tipsUsdt: 45.0,
          isGenesis: true,
        });
        validPosts.push({
          id: 901,
          author: '0x16c5cb15a0ceb9f5dc83b9fe58aa475b0363ddac',
          rawContent: '#DeFi 📊 SocialFi analytics update: 95% direct tipping vault split is officially outperforming traditional web2 creator models.',
          content: '#DeFi 📊 SocialFi analytics update: 95% direct tipping vault split is officially outperforming traditional web2 creator models.',
          mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          timestamp: Math.floor(Date.now() / 1000) - 5400,
          tipsUsdt: 20.0,
          isGenesis: true,
        });
        validPosts.push({
          id: 900,
          author: '0x00299f76c116d2f03e342e6911e16a892b02c4e3',
          rawContent: '#NFT 🎨 Generative mood art minted and tied to my on-chain stream. Tip in USDT to unlock the high-res NFT badge!',
          content: '#NFT 🎨 Generative mood art minted and tied to my on-chain stream. Tip in USDT to unlock the high-res NFT badge!',
          mediaUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
          timestamp: Math.floor(Date.now() / 1000) - 10800,
          tipsUsdt: 15.0,
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

    let finalPayload = quickContent.trim();
    if (quickMedia.trim()) {
      finalPayload = `${finalPayload} [media:${quickMedia.trim()}]`;
    }

    setIsBroadcasting(true);
    try {
      toast.loading('Broadcasting to BOT Chain...', { id: 'quick-broadcast' });

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'createPost',
        args: [finalPayload],
      });

      toast.loading('Mining transaction on-chain...', { id: 'quick-broadcast' });
      await new Promise((r) => setTimeout(r, 3500));

      toast.success('🎉 Update broadcasted to ledger successfully! (+10 $XMS)', { id: 'quick-broadcast' });
      setQuickContent('');
      setQuickMedia('');
      setShowQuickMedia(false);
      fetchPostsFromChain();
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Broadcast failed', { id: 'quick-broadcast' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filter posts by category tag
  const filteredPosts = posts.filter((post) => {
    if (activeCategory === 'all') return true;
    return post.rawContent?.includes(activeCategory);
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#090C15] text-[#F3F4F6]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 w-full py-6 sm:py-8 space-y-6">
        
        {/* Quick Creator Studio Card */}
        <div className="bg-[#0E131F] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F5A0] via-[#00D9F5] to-[#6366F1] flex items-center justify-center font-mono font-bold text-sm text-[#090C15] shrink-0 shadow-lg shadow-[#00F5A0]/20">
              {address ? address.slice(2, 4).toUpperCase() : 'X'}
            </div>

            <form onSubmit={handleQuickBroadcast} className="flex-grow space-y-3">
              <textarea
                rows={2}
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                placeholder="What's your mood or alpha? Broadcast directly to the BOT Chain ledger..."
                className="w-full bg-[#090C15] border border-[#1E293B] focus:border-[#00F5A0] rounded-xl p-3 text-sm text-[#F3F4F6] placeholder-[#64748B] outline-none transition-colors resize-none font-sans"
                maxLength={280}
              />

              {showQuickMedia && (
                <div className="p-3 bg-[#090C15] border border-[#1E293B] rounded-xl space-y-2">
                  <input
                    type="url"
                    value={quickMedia}
                    onChange={(e) => setQuickMedia(e.target.value)}
                    placeholder="Enter Image URL (e.g. Unsplash, IPFS, Imgur, GIF)..."
                    className="w-full bg-[#0E131F] border border-[#1E293B] focus:border-[#00F5A0] rounded-lg px-3 py-1.5 text-xs font-mono text-[#F3F4F6] outline-none"
                  />
                  {quickMedia && (
                    <img
                      src={quickMedia}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-[#1E293B]"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickMedia(!showQuickMedia)}
                    className="flex items-center space-x-1 text-xs font-mono text-[#94A3B8] hover:text-[#00F5A0] transition-colors p-1.5 rounded-lg hover:bg-[#182032]"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#00F5A0]" />
                    <span>{showQuickMedia ? 'Close Media' : 'Attach Image'}</span>
                  </button>
                  <span className="text-[11px] font-mono text-[#00F5A0] hidden sm:inline">
                    • Earns 10 $XMS
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting || !quickContent.trim() || !isConnected}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#6366F1] text-[#090C15] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#00F5A0]/20 transition-all hover:scale-[1.02]"
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#090C15]" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#090C15]" />
                      <span>Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Category Filter Tabs & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E131F] border border-[#1E293B] p-2 rounded-2xl">
          <div className="flex flex-wrap gap-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                  activeCategory === tab.id
                    ? 'bg-[#00F5A0] text-[#090C15] font-bold shadow-md shadow-[#00F5A0]/20'
                    : 'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#182032]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchPostsFromChain}
            className="p-2 rounded-xl bg-[#090C15] border border-[#1E293B] hover:border-[#00F5A0]/50 text-[#94A3B8] hover:text-[#00F5A0] transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Feed List */}
        {loading && posts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-[#94A3B8]">
              Loading verified streams from BOT Chain Testnet...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-[#0E131F] border border-[#1E293B] rounded-2xl p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-[#64748B] mx-auto opacity-50" />
            <h3 className="font-grotesk font-bold text-base text-[#F3F4F6]">
              No streams in this category yet
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Be the first creator to broadcast in this category and earn $XMS rewards!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-[#0E131F] border border-[#1E293B] hover:border-[#00F5A0]/40 rounded-2xl p-5 shadow-xl transition-all space-y-3.5 group"
              >
                {/* Creator Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F5A0] to-[#6366F1] flex items-center justify-center font-mono font-bold text-xs text-[#090C15] shadow-sm">
                      {post.author.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#F3F4F6]">
                          {post.author.slice(0, 6)}...{post.author.slice(-4)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#00F5A0]/10 text-[#00F5A0] text-[10px] font-mono font-semibold border border-[#00F5A0]/20">
                          Creator
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#64748B]">
                        TX #{post.id} • {post.timestamp > 0 ? new Date(post.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </div>
                    </div>
                  </div>

                  {/* Total Tipped Pill */}
                  <div className="px-2.5 py-1 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-mono text-xs font-bold flex items-center space-x-1">
                    <Heart className="w-3.5 h-3.5 fill-current text-[#F59E0B]" />
                    <span>+{post.tipsUsdt.toFixed(1)} USDT</span>
                  </div>
                </div>

                {/* Content Message */}
                <p className="text-sm font-sans text-[#F3F4F6] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Attached Image / Media Banner (if present) */}
                {post.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#1E293B] max-h-80 bg-[#090C15]">
                    <img
                      src={post.mediaUrl}
                      alt="Stream media"
                      className="w-full h-auto max-h-80 object-cover group-hover:scale-[1.01] transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Action Bar: Tip Creator Button & Details */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1E293B] text-xs font-mono">
                  <div className="flex items-center space-x-3 text-[#64748B]">
                    <span>95% Creator Split</span>
                    <span>•</span>
                    <a
                      href={`${CONTRACT_ADDRESSES.explorer}/address/${post.author}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#94A3B8] hover:text-[#00F5A0] flex items-center space-x-1 transition-colors"
                    >
                      <span>BotScan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => setSelectedPostForTip(post)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#F59E0B]/10 hover:bg-[#F59E0B] text-[#F59E0B] hover:text-[#090C15] border border-[#F59E0B]/40 font-grotesk font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Tip USDT</span>
                  </button>
                </div>

              </article>
            ))}
          </div>
        )}

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
        onClose={() => setSelectedPostForTip(null)}
        post={selectedPostForTip || {}}
        onTipSuccess={fetchPostsFromChain}
      />

      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
