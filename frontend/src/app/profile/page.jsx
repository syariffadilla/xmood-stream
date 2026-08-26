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
  TrendingUp,
  Compass
} from 'lucide-react';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Read native BOT balance
  const { data: nativeBalance } = useBalance({
    address: address,
    query: { enabled: !!address },
  });

  // Read mUSDT Balance
  const { data: usdtBalance, refetch: refetchUsdt } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read XMS Balance
  const { data: xmsBalance, refetch: refetchXms } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read Tips Received from TipVault
  const { data: totalTipsReceived } = useReadContract({
    address: CONTRACT_ADDRESSES.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsReceived',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read Tips Sent from TipVault
  const { data: totalTipsSent } = useReadContract({
    address: CONTRACT_ADDRESSES.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsSent',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read User Post Count
  const { data: userPostCount } = useReadContract({
    address: CONTRACT_ADDRESSES.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getUserPostCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Fetch author posts from smart contract
  useEffect(() => {
    async function loadUserPosts() {
      if (!publicClient || !address) {
        setLoadingPosts(false);
        return;
      }

      setLoadingPosts(true);
      try {
        const totalPosts = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.XMoodStreamCore,
          abi: CORE_ABI,
          functionName: 'getTotalPosts',
        });

        const count = Number(totalPosts);
        const postsFound = [];

        for (let i = count; i >= 1; i--) {
          try {
            const post = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.XMoodStreamCore,
              abi: CORE_ABI,
              functionName: 'getPost',
              args: [BigInt(i)],
            });

            if (post.author.toLowerCase() === address.toLowerCase()) {
              const tipData = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.TipVault,
                abi: TIP_VAULT_ABI,
                functionName: 'getPostTips',
                args: [BigInt(i)],
              });

              postsFound.push({
                id: Number(post.id),
                author: post.author,
                content: post.content,
                timestamp: Number(post.timestamp),
                tipsUsdt: parseFloat(formatUnits(tipData[0], 6)),
              });
            }
          } catch (e) {
            // ignore single post error
          }
        }

        setUserPosts(postsFound);
      } catch (err) {
        console.error('Failed to load profile posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    }

    loadUserPosts();
  }, [publicClient, address, userPostCount]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const usdtFormatted = usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(2) : '0.00';
  const xmsFormatted = xmsBalance !== undefined ? parseFloat(formatUnits(xmsBalance, 18)).toFixed(2) : '0.00';
  const nativeFormatted = nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(3) : '0.000';
  const tipsReceivedFormatted = totalTipsReceived !== undefined ? parseFloat(formatUnits(totalTipsReceived, 6)).toFixed(2) : '0.00';
  const tipsSentFormatted = totalTipsSent !== undefined ? parseFloat(formatUnits(totalTipsSent, 6)).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen flex flex-col bg-[#090C15] text-[#F3F4F6]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-gradient-to-br from-[#0E131F] via-[#111726] to-[#090C15] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F5A0] via-[#00D9F5] to-[#6366F1] flex items-center justify-center font-mono text-xl font-bold text-[#090C15] shadow-xl shadow-[#00F5A0]/20">
                {address ? address.slice(2, 4).toUpperCase() : '0x'}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-grotesk font-bold text-xl sm:text-2xl text-[#F3F4F6]">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet Disconnected'}
                  </h1>
                  {address && (
                    <button
                      onClick={copyAddress}
                      className="p-1.5 rounded-lg hover:bg-[#182032] text-[#94A3B8] hover:text-[#00F5A0] transition-colors"
                      title="Copy Address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mt-1 text-xs font-mono text-[#94A3B8]">
                  <span>Network: <strong className="text-[#00F5A0]">{CONTRACT_ADDRESSES.chainName}</strong></span>
                  <span>•</span>
                  {address && (
                    <a
                      href={`${CONTRACT_ADDRESSES.explorer}/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00F5A0] hover:underline flex items-center space-x-1"
                    >
                      <span>View on BotScan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Faucet Trigger */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#090C15] border border-[#F59E0B]/50 hover:bg-[#F59E0B]/10 text-[#F59E0B] font-mono text-xs font-semibold flex items-center space-x-2 transition-all"
              >
                <Coins className="w-4 h-4" />
                <span>Get +100 mUSDT</span>
              </button>
            </div>

          </div>
        </div>

        {/* Balance & Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Native Gas (BOT) */}
          <div className="bg-[#0E131F] border border-[#1E293B] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Native Gas</span>
              <Compass className="w-4 h-4 text-[#00F5A0]" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#F3F4F6] pt-1">
              {nativeFormatted} <span className="text-xs text-[#94A3B8]">BOT</span>
            </div>
            <div className="text-[11px] font-mono text-[#00F5A0]">
              BOT Chain Testnet
            </div>
          </div>

          {/* Card 2: mUSDT Balance */}
          <div className="bg-[#0E131F] border border-[#1E293B] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Tipping Balance</span>
              <Coins className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#F59E0B] pt-1">
              {usdtFormatted} <span className="text-xs text-[#94A3B8]">USDT</span>
            </div>
            <div className="text-[11px] font-mono text-[#94A3B8]">
              Sent: {tipsSentFormatted} USDT
            </div>
          </div>

          {/* Card 3: XMS Token Balance */}
          <div className="bg-[#0E131F] border border-[#1E293B] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Loyalty & Gas Token</span>
              <Sparkles className="w-4 h-4 text-[#00F5A0]" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#00F5A0] pt-1">
              {xmsFormatted} <span className="text-xs text-[#94A3B8]">XMS</span>
            </div>
            <div className="text-[11px] font-mono text-[#00F5A0]">
              Active Protocol Utility
            </div>
          </div>

          {/* Card 4: Tips Earned */}
          <div className="bg-[#0E131F] border border-[#1E293B] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Creator Earnings</span>
              <Heart className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#F3F4F6] pt-1">
              {tipsReceivedFormatted} <span className="text-xs text-[#94A3B8]">USDT</span>
            </div>
            <div className="text-[11px] font-mono text-[#00F5A0]">
              95% Direct Vault Split
            </div>
          </div>

        </div>

        {/* User Broadcasts List */}
        <div className="bg-[#0E131F] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between ledger-border-b pb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-[#00F5A0]" />
              <h2 className="font-grotesk font-bold text-lg text-[#F3F4F6]">
                Your Broadcasted Streams
              </h2>
            </div>
            <span className="text-xs font-mono text-[#94A3B8]">
              {userPosts.length} Streams Recorded
            </span>
          </div>

          {!isConnected ? (
            <div className="py-12 text-center text-sm font-mono text-[#94A3B8]">
              Connect your wallet to view your on-chain broadcast history
            </div>
          ) : loadingPosts ? (
            <div className="py-12 text-center text-sm font-mono text-[#94A3B8] space-y-2">
              <div className="w-6 h-6 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Scanning blockchain for your posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Layers className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              <p className="font-grotesk font-semibold text-sm text-[#F3F4F6]">
                No broadcasts published yet
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00F5A0] hover:bg-[#00F5A0]/90 text-[#090C15] font-grotesk font-bold text-xs uppercase transition-all"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#090C15] border border-[#1E293B] hover:border-[#00F5A0]/40 rounded-xl p-4 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-[#94A3B8]">
                      TX #{post.id} • {post.timestamp > 0 ? new Date(post.timestamp * 1000).toLocaleString() : 'Recent'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-xs font-bold border border-[#F59E0B]/30">
                      +{post.tipsUsdt.toFixed(2)} USDT Tipped
                    </span>
                  </div>
                  <p className="font-sans text-sm text-[#F3F4F6] leading-relaxed my-2">
                    {post.content}
                  </p>
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
      />
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
    </div>
  );
}
