'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import FaucetModal from '../../components/FaucetModal';
import { useAccount, useReadContract, usePublicClient, useBalance } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../contracts/addresses';
import { MOCK_USDT_ABI, REWARD_TOKEN_ABI, CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { 
  User, 
  Wallet, 
  Coins, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  ExternalLink, 
  Copy, 
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Read native ETH balance
  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  // Read mUSDT balance
  const { data: usdtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read $XMS balance
  const { data: xmsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read total tips received by user
  const { data: totalTipsReceived } = useReadContract({
    address: CONTRACT_ADDRESSES.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsReceived',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read total tips sent by user
  const { data: totalTipsSent } = useReadContract({
    address: CONTRACT_ADDRESSES.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsSent',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read user posts count
  const { data: postCount } = useReadContract({
    address: CONTRACT_ADDRESSES.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getUserPostCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Fetch specific posts by user
  const fetchUserPosts = async () => {
    if (!publicClient || !address) return;
    setLoadingPosts(true);
    try {
      const postIds = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'getUserPosts',
        args: [address],
      });

      const list = [];
      for (const id of postIds) {
        try {
          const post = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.XMoodStreamCore,
            abi: CORE_ABI,
            functionName: 'getPost',
            args: [id],
          });

          const postTipAmount = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.TipVault,
            abi: TIP_VAULT_ABI,
            functionName: 'postTips',
            args: [id],
          });

          list.push({
            id: Number(post.id),
            author: post.author,
            content: post.contentHash,
            timestamp: Number(post.timestamp),
            tipsUsdt: parseFloat(formatUnits(postTipAmount, 6)),
          });
        } catch (e) {
          console.error(e);
        }
      }

      setUserPosts(list.reverse());
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [publicClient, address, postCount]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12151C] text-[#ECEDEF]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#3ED6C4] to-[#1E56E0] p-0.5 shadow-lg">
                <div className="w-full h-full bg-[#1B1F29] rounded-[10px] flex items-center justify-center font-mono font-bold text-xl text-[#3ED6C4]">
                  {address ? address.slice(2, 4).toUpperCase() : '??'}
                </div>
                {isConnected && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#3FA796] border-2 border-[#1B1F29] rounded-full"></span>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-grotesk font-bold text-xl text-[#ECEDEF]">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet Not Connected'}
                  </h1>
                  {address && (
                    <button
                      onClick={copyAddress}
                      className="p-1 text-[#8B92A3] hover:text-[#3ED6C4] transition-colors"
                      title="Copy Address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mt-1 text-xs font-mono text-[#8B92A3]">
                  <span>Network: <strong className="text-[#3ED6C4]">{CONTRACT_ADDRESSES.chainName}</strong></span>
                  <span>•</span>
                  {address && (
                    <a
                      href={`https://sepolia.basescan.org/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#ECEDEF] flex items-center space-x-1"
                    >
                      <span>Basescan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#12151C] border border-[#E8A33D]/50 hover:bg-[#E8A33D]/10 text-[#E8A33D] font-mono text-xs font-semibold transition-all"
              >
                <Coins className="w-4 h-4" />
                <span>Get mUSDT Faucet</span>
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-[#3ED6C4]/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>New Broadcast</span>
              </button>
            </div>

          </div>
        </div>

        {/* Ledger Balance & Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* mUSDT Balance */}
          <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-center text-[#8B92A3] mb-2 font-mono text-xs">
              <span>mUSDT Balance</span>
              <Coins className="w-4 h-4 text-[#E8A33D]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#E8A33D]">
              {usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(2) : '0.00'}
            </div>
            <div className="text-[11px] font-mono text-[#8B92A3] mt-1">
              For tipping creators on-chain
            </div>
          </div>

          {/* $XMS Balance */}
          <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-center text-[#8B92A3] mb-2 font-mono text-xs">
              <span>$XMS Rewards</span>
              <Sparkles className="w-4 h-4 text-[#3FA796]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#3FA796]">
              {xmsBalance !== undefined ? parseFloat(formatUnits(xmsBalance, 18)).toFixed(2) : '0.00'}
            </div>
            <div className="text-[11px] font-mono text-[#8B92A3] mt-1">
              Earned via SocialFi activity
            </div>
          </div>

          {/* Tips Received */}
          <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-center text-[#8B92A3] mb-2 font-mono text-xs">
              <span>Tips Received</span>
              <TrendingUp className="w-4 h-4 text-[#3ED6C4]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#ECEDEF]">
              {totalTipsReceived !== undefined ? parseFloat(formatUnits(totalTipsReceived, 6)).toFixed(2) : '0.00'} <span className="text-xs text-[#8B92A3]">USDT</span>
            </div>
            <div className="text-[11px] font-mono text-[#8B92A3] mt-1">
              Direct creator earnings (95%)
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-center text-[#8B92A3] mb-2 font-mono text-xs">
              <span>Total Posts</span>
              <Layers className="w-4 h-4 text-[#8B92A3]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#ECEDEF]">
              {postCount ? postCount.toString() : '0'}
            </div>
            <div className="text-[11px] font-mono text-[#8B92A3] mt-1">
              Verified broadcasts on Core
            </div>
          </div>

        </div>

        {/* User Broadcast History */}
        <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center ledger-border-b pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3ED6C4]"></span>
              <h2 className="font-grotesk font-bold text-lg text-[#ECEDEF]">
                Your Broadcast Ledger
              </h2>
            </div>
            <span className="font-mono text-xs text-[#8B92A3]">
              {userPosts.length} Entries
            </span>
          </div>

          {!isConnected ? (
            <div className="p-8 text-center text-xs font-mono text-[#8B92A3]">
              Please connect your wallet to view your broadcast ledger and activity.
            </div>
          ) : loadingPosts ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="bg-[#12151C] p-4 rounded-lg animate-pulse h-20"></div>
              ))}
            </div>
          ) : userPosts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-mono text-[#8B92A3] mb-3">
                You haven't broadcasted any posts on-chain yet.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-xs uppercase"
              >
                Broadcast Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#10131A] border border-[#282D3B] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#3ED6C4]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-[#3ED6C4] font-semibold">
                        Post #{post.id}
                      </span>
                      <span className="text-[#656C7D]">•</span>
                      <span className="font-mono text-[11px] text-[#8B92A3]">
                        {post.timestamp > 0 ? new Date(post.timestamp * 1000).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-[#ECEDEF]">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="px-3 py-1 rounded bg-[#1B1F29] border border-[#E8A33D]/30 font-mono text-xs text-[#E8A33D] font-bold">
                      +{post.tipsUsdt.toFixed(2)} USDT
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
        onPostCreated={fetchUserPosts}
      />
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
