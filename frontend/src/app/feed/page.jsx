'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import TipModal from '../../components/TipModal';
import FaucetModal from '../../components/FaucetModal';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { getContractAddresses, parsePostContent } from '../../contracts/addresses';
import { CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import {
  Radio,
  Send,
  Coins,
  RefreshCw,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  Share2,
} from 'lucide-react';

const CATEGORIES = ['All', '#Alpha', '#DePIN', '#DeFi', '#NFT', '#SocialFi', '#Meme'];

export default function FeedPage() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContractAddresses(chain?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Inline Quick Post state
  const [quickContent, setQuickContent] = useState('');
  const [quickCategory, setQuickCategory] = useState('#Alpha');
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // Feed items state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Wagmi write hook for quick posting
  const { data: writeHash, writeContract, isPending: isWritePending } = useWriteContract();
  const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  // Fetch real on-chain posts
  const fetchPosts = useCallback(async () => {
    if (!publicClient || !contracts.XMoodStreamCore) return;
    try {
      const count = await publicClient.readContract({
        address: contracts.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'getTotalPosts',
      });

      const total = Number(count);
      if (total === 0) {
        setPosts([]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const postPromises = [];
      for (let i = total; i >= 1; i--) {
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
      setPosts(results.filter(Boolean));
    } catch (err) {
      console.error('Failed to query stream:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [publicClient, contracts.XMoodStreamCore, contracts.TipVault]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 6000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  // Handle Quick Post Submit
  const handleQuickPost = () => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!quickContent.trim()) {
      toast.error('Write a message to broadcast');
      return;
    }

    let payload = `${quickCategory} ${quickContent.trim()}`;
    if (quickImageUrl.trim()) {
      payload += ` [media:${quickImageUrl.trim()}]`;
    }

    writeContract({
      address: contracts.XMoodStreamCore,
      abi: CORE_ABI,
      functionName: 'createPost',
      args: [payload],
    });
  };

  useEffect(() => {
    if (isTxSuccess) {
      toast.success('Broadcasted to on-chain ledger');
      setQuickContent('');
      setQuickImageUrl('');
      setShowImageInput(false);
      fetchPosts();
    }
  }, [isTxSuccess, fetchPosts]);

  const handleOpenTip = (post) => {
    setSelectedPost(post);
    setIsTipOpen(true);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (activeCategory === 'All') return true;
    const parsed = parsePostContent(post.rawContent);
    return parsed.tag.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-base text-main selection:bg-gold selection:text-base">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Telemetry */}
        <div className="flex items-center justify-between pb-6 border-b border-line">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-main">
              Stream Feed
            </h1>
            <p className="text-sub text-xs mt-0.5">
              Live immutable stream on <span className="font-mono text-main">{contracts.chainName}</span>
            </p>
          </div>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchPosts();
            }}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-surface hover:bg-elevated border border-line text-sub hover:text-main transition-colors flex items-center space-x-1.5 text-xs font-mono"
            title="Refresh stream from RPC"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>

        {/* Inline Quick Broadcast Box */}
        <div className="mt-6 p-4 rounded-xl bg-surface border border-line space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-semibold text-main">New Broadcast</span>
            <span className="font-mono text-[11px] text-sub">95% Tip Routing</span>
          </div>

          <textarea
            value={quickContent}
            onChange={(e) => setQuickContent(e.target.value)}
            placeholder="Share an insight, market alpha, or project update..."
            rows={3}
            maxLength={280}
            className="w-full bg-base border border-line rounded-lg p-3 text-xs sm:text-sm text-main placeholder-sub/60 focus:outline-none focus:border-gold transition-colors resize-none"
          />

          {showImageInput && (
            <input
              type="url"
              value={quickImageUrl}
              onChange={(e) => setQuickImageUrl(e.target.value)}
              placeholder="Paste direct image URL (https://...)"
              className="w-full bg-base border border-line rounded-lg px-3 py-2 text-xs text-main placeholder-sub/60 focus:outline-none focus:border-gold font-mono"
            />
          )}

          {/* Quick Category Tags + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              {['#Alpha', '#DePIN', '#DeFi', '#NFT', '#SocialFi', '#Meme'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setQuickCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    quickCategory === cat
                      ? 'bg-elevated text-gold border border-gold/40 font-semibold'
                      : 'text-sub hover:text-main hover:bg-elevated'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`p-1.5 rounded bg-elevated border border-line transition-colors ${
                  showImageInput || quickImageUrl ? 'text-gold' : 'text-sub hover:text-main'
                }`}
                title="Attach Image URL"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleQuickPost}
                disabled={isWritePending || isTxWaiting || !quickContent.trim()}
                className="px-4 py-1.5 rounded-lg bg-gold hover:bg-gold-hover disabled:opacity-50 text-base font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                {isWritePending || isTxWaiting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stream Filter Pills */}
        <div className="mt-6 flex items-center space-x-1.5 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                activeCategory === cat
                  ? 'bg-surface text-main font-semibold border border-line'
                  : 'text-sub hover:text-main hover:bg-surface/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stream Feed Entries */}
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="p-12 rounded-xl bg-surface border border-line text-center text-sub font-mono text-xs">
              Synchronizing broadcasts from {contracts.chainName}...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 rounded-xl bg-surface border border-line text-center space-y-3">
              <p className="text-main font-semibold text-sm">
                No broadcasts found in category &quot;{activeCategory}&quot;
              </p>
              <p className="text-sub text-xs max-w-sm mx-auto">
                Write a broadcast using the studio above to create the first on-chain record for this tag.
              </p>
              {activeCategory !== 'All' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-3 py-1.5 rounded-lg bg-elevated border border-line text-main text-xs font-mono hover:bg-line transition-colors"
                >
                  View All Broadcasts
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const parsed = parsePostContent(post.rawContent);
              const postDate = new Date(post.timestamp * 1000);
              const timeAgo = postDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <article
                  key={post.id}
                  className="p-5 rounded-xl bg-surface border border-line hover:border-sub/30 transition-colors space-y-3"
                >
                  {/* Card Header: Author, Timestamp, and Tip Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-elevated border border-line flex items-center justify-center text-[10px] font-mono font-bold text-main">
                        {post.author.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <a
                          href={`${contracts.explorer}/address/${post.author}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-main hover:text-gold flex items-center space-x-1"
                        >
                          <span>{post.author.slice(0, 6)}...{post.author.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3 text-sub" />
                        </a>
                        <div className="text-[10px] font-mono text-sub">
                          {timeAgo} • Entry #{post.id}
                        </div>
                      </div>
                    </div>

                    {/* Signature Settlement Voucher Stamp */}
                    {post.tipsEarned > 0 && (
                      <div className="px-2.5 py-1 rounded bg-gold/10 border border-gold/30 flex items-center space-x-1.5 text-right font-mono">
                        <span className="text-[10px] text-sub uppercase">Tipped:</span>
                        <span className="text-xs font-bold text-gold">
                          +{post.tipsEarned.toFixed(2)} USDT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    {parsed.tag && (
                      <span className="inline-block px-2 py-0.5 rounded bg-elevated border border-line text-glacier text-[11px] font-mono font-medium">
                        {parsed.tag}
                      </span>
                    )}
                    <p className="text-sm text-main leading-relaxed whitespace-pre-line">
                      {parsed.text}
                    </p>
                  </div>

                  {/* Media Attachment */}
                  {parsed.imageUrl && (
                    <div className="rounded-lg border border-line overflow-hidden max-h-72 bg-base">
                      <img
                        src={parsed.imageUrl}
                        alt="Stream attachment"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-mono text-sub">
                    <span className="text-[11px]">
                      Vault: 95% Creator / 5% Protocol
                    </span>

                    <button
                      onClick={() => handleOpenTip(post)}
                      className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-gold hover:text-base border border-line text-main text-xs font-mono transition-colors flex items-center space-x-1.5"
                    >
                      <Coins className="w-3.5 h-3.5 text-gold" />
                      <span>Tip USDT</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          fetchPosts();
        }}
      />

      <TipModal
        isOpen={isTipOpen}
        onClose={() => {
          setIsTipOpen(false);
          fetchPosts();
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
