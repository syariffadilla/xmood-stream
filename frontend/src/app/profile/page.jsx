'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import FaucetModal from '../../components/FaucetModal';
import { useAccount, useReadContract, usePublicClient, useBalance } from 'wagmi';
import { getContractAddresses, parsePostContent } from '../../contracts/addresses';
import { MOCK_USDT_ABI, REWARD_TOKEN_ABI, CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import {
  User,
  Radio,
  Coins,
  Gift,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

export default function ProfilePage() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContractAddresses(chain?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Wagmi native BOT balance
  const { data: botBalance, refetch: refetchBot } = useBalance({
    address: address,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  // Wagmi mUSDT balance
  const { data: usdtBalance, refetch: refetchUsdt } = useReadContract({
    address: contracts.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  // Wagmi XMS balance
  const { data: xmsBalance, refetch: refetchXms } = useReadContract({
    address: contracts.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  // Wagmi Tips Received
  const { data: tipsReceivedData, refetch: refetchTipsRecv } = useReadContract({
    address: contracts.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsReceived',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  // Wagmi Tips Sent
  const { data: tipsSentData, refetch: refetchTipsSent } = useReadContract({
    address: contracts.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsSent',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  // Fetch author posts from smart contract
  const fetchUserPosts = useCallback(async () => {
    if (!publicClient || !contracts.XMoodStreamCore || !address) {
      setUserPosts([]);
      setLoadingPosts(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setLoadingPosts(true);

      // Strategy 1: Call getUserPosts
      let postIds = [];
      try {
        const ids = await publicClient.readContract({
          address: contracts.XMoodStreamCore,
          abi: CORE_ABI,
          functionName: 'getUserPosts',
          args: [address],
        });
        postIds = ids.map(id => Number(id));
      } catch (e) {
        postIds = [];
      }

      // Strategy 2: If empty, scan totalPosts
      if (postIds.length === 0) {
        try {
          const totalPostsBig = await publicClient.readContract({
            address: contracts.XMoodStreamCore,
            abi: CORE_ABI,
            functionName: 'getTotalPosts',
          });
          const totalPosts = Number(totalPostsBig);
          const allPostPromises = [];
          for (let i = totalPosts; i >= 1; i--) {
            allPostPromises.push(
              publicClient.readContract({
                address: contracts.XMoodStreamCore,
                abi: CORE_ABI,
                functionName: 'getPost',
                args: [BigInt(i)],
              }).catch(() => null)
            );
          }
          const allPosts = await Promise.all(allPostPromises);
          allPosts.forEach(p => {
            if (p && p.author.toLowerCase() === address.toLowerCase()) {
              postIds.push(Number(p.id));
            }
          });
        } catch (err) {}
      }

      if (postIds.length === 0) {
        setUserPosts([]);
        setLoadingPosts(false);
        setIsRefreshing(false);
        return;
      }

      // Fetch details in parallel
      const postDetailsPromises = postIds.map(async (postId) => {
        try {
          const post = await publicClient.readContract({
            address: contracts.XMoodStreamCore,
            abi: CORE_ABI,
            functionName: 'getPost',
            args: [BigInt(postId)],
          });

          let postTips = BigInt(0);
          try {
            postTips = await publicClient.readContract({
              address: contracts.TipVault,
              abi: TIP_VAULT_ABI,
              functionName: 'postTips',
              args: [BigInt(postId)],
            });
          } catch (e) {}

          return {
            id: Number(post.id),
            author: post.author,
            rawContent: post.contentHash,
            timestamp: Number(post.timestamp),
            tipsEarned: parseFloat(formatUnits(postTips, 6)),
          };
        } catch (e) {
          return null;
        }
      });

      const resolvedPosts = await Promise.all(postDetailsPromises);
      const validSorted = resolvedPosts.filter(Boolean).sort((a, b) => b.id - a.id);
      setUserPosts(validSorted);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    } finally {
      setLoadingPosts(false);
      setIsRefreshing(false);
    }
  }, [publicClient, contracts.XMoodStreamCore, contracts.TipVault, address]);

  useEffect(() => {
    fetchUserPosts();
    const interval = setInterval(fetchUserPosts, 8000);
    return () => clearInterval(interval);
  }, [fetchUserPosts]);

  const handleManualSync = () => {
    setIsRefreshing(true);
    refetchBot();
    refetchUsdt();
    refetchXms();
    refetchTipsRecv();
    refetchTipsSent();
    fetchUserPosts();
    toast.success('Synchronized with ledger');
  };

  const usdtFormatted = usdtBalance !== undefined
    ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(2)
    : '0.00';

  const xmsFormatted = xmsBalance !== undefined
    ? parseFloat(formatUnits(xmsBalance, 18)).toFixed(2)
    : '0.00';

  const tipsReceivedFormatted = tipsReceivedData !== undefined
    ? parseFloat(formatUnits(tipsReceivedData, 6)).toFixed(2)
    : '0.00';

  const tipsSentFormatted = tipsSentData !== undefined
    ? parseFloat(formatUnits(tipsSentData, 6)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen flex flex-col bg-base text-main selection:bg-gold selection:text-base">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Profile Header Card */}
        <div className="p-6 rounded-xl bg-surface border border-line space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-elevated border border-line flex items-center justify-center text-main font-mono font-bold text-sm">
                {address ? address.slice(2, 4).toUpperCase() : '0x'}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-main">
                    {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not Connected'}
                  </span>
                  {address && (
                    <a
                      href={`${contracts.explorer}/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sub hover:text-gold transition-colors"
                      title="View on Block Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] font-mono text-sub mt-0.5">
                  Connected Network: {contracts.chainName} ({contracts.chainId})
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualSync}
                disabled={isRefreshing || !address}
                className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-line border border-line text-sub hover:text-main text-xs font-mono transition-colors flex items-center space-x-1.5"
                title="Refresh balances and on-chain records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast</span>
              </button>
            </div>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-line">
            
            <div className="p-3 rounded-lg bg-base border border-line">
              <div className="text-[10px] font-mono text-sub uppercase">mUSDT Balance</div>
              <div className="text-base font-mono font-bold text-gold mt-0.5">
                {usdtFormatted}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-base border border-line">
              <div className="text-[10px] font-mono text-sub uppercase">$XMS Balance</div>
              <div className="text-base font-mono font-bold text-glacier mt-0.5">
                {xmsFormatted}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-base border border-line">
              <div className="text-[10px] font-mono text-sub uppercase">Tips Earned (95%)</div>
              <div className="text-base font-mono font-bold text-main mt-0.5">
                +{tipsReceivedFormatted} <span className="text-[10px] font-normal text-sub">USDT</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-base border border-line">
              <div className="text-[10px] font-mono text-sub uppercase">Tips Sent</div>
              <div className="text-base font-mono font-bold text-sub mt-0.5">
                {tipsSentFormatted} <span className="text-[10px] font-normal text-sub">USDT</span>
              </div>
            </div>

          </div>

        </div>

        {/* User Stream Records Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-main">
              Authored Broadcasts ({userPosts.length})
            </h2>
            <span className="font-mono text-xs text-sub">
              Immutable Records
            </span>
          </div>

          {!isConnected ? (
            <div className="p-12 rounded-xl bg-surface border border-line text-center space-y-2">
              <Wallet className="w-8 h-8 text-sub mx-auto mb-2" />
              <p className="text-main font-semibold text-sm">Wallet Not Connected</p>
              <p className="text-sub text-xs">Connect your wallet to review your on-chain broadcasts and earned tips.</p>
            </div>
          ) : loadingPosts ? (
            <div className="p-12 rounded-xl bg-surface border border-line text-center text-sub font-mono text-xs">
              Synchronizing broadcasts for {address.slice(0, 6)}...{address.slice(-4)}...
            </div>
          ) : userPosts.length === 0 ? (
            <div className="p-12 rounded-xl bg-surface border border-line text-center space-y-3">
              <p className="text-main font-semibold text-sm">No broadcasts published yet.</p>
              <p className="text-sub text-xs max-w-sm mx-auto">
                Share an insight to record your first immutable entry to the ledger and start receiving tips.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-base font-semibold text-xs transition-colors"
              >
                Create First Broadcast
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => {
                const parsed = parsePostContent(post.rawContent);
                const postDate = new Date(post.timestamp * 1000);
                const timeAgo = postDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={post.id}
                    className="p-5 rounded-xl bg-surface border border-line hover:border-sub/30 transition-colors space-y-3"
                  >
                    {/* Entry Header */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-main font-bold">Entry #{post.id}</span>
                        <span className="text-line">•</span>
                        <span className="text-sub">{timeAgo}</span>
                      </div>

                      {post.tipsEarned > 0 ? (
                        <span className="px-2.5 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold font-bold text-[11px]">
                          +{post.tipsEarned.toFixed(2)} USDT Tipped
                        </span>
                      ) : (
                        <span className="text-sub text-[11px]">0.00 USDT</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      {parsed.tag && (
                        <span className="inline-block px-2 py-0.5 rounded bg-elevated border border-line text-glacier text-[11px] font-mono font-medium">
                          {parsed.tag}
                        </span>
                      )}
                      <p className="text-sm text-main leading-relaxed">
                        {parsed.text}
                      </p>
                    </div>

                    {/* Media Attachment if present */}
                    {parsed.imageUrl && (
                      <div className="rounded-lg border border-line overflow-hidden max-h-64 bg-base">
                        <img
                          src={parsed.imageUrl}
                          alt="Stream attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Entry Footer */}
                    <div className="pt-2.5 border-t border-line flex items-center justify-between text-[11px] font-mono text-sub">
                      <span>Smart Contract: XMoodStreamCore</span>
                      <a
                        href={`${contracts.explorer}/address/${contracts.XMoodStreamCore}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-main flex items-center space-x-1"
                      >
                        <span>View Contract</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          fetchUserPosts();
        }}
      />

      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => {
          setIsFaucetOpen(false);
          refetchUsdt();
        }}
      />
    </div>
  );
}
