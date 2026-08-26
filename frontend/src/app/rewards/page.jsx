'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import FaucetModal from '../../components/FaucetModal';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../contracts/addresses';
import { REWARD_DISTRIBUTOR_ABI, REWARD_TOKEN_ABI, CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { 
  Gift, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Coins, 
  Loader2, 
  Layers, 
  Heart, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function RewardsPage() {
  const { address, isConnected } = useAccount();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Read pending reward
  const { data: pendingReward, refetch: refetchPending } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'calculatePendingReward',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read canClaim status
  const { data: isEligibleToClaim, refetch: refetchCanClaim } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read time until next claim
  const { data: secondsRemaining, refetch: refetchTimer } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'timeUntilNextClaim',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read total rewards claimed by user
  const { data: totalClaimed, refetch: refetchTotalClaimed } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'totalRewardsClaimed',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read current posts and tips for quest indicators
  const { data: userPostsCount } = useReadContract({
    address: CONTRACT_ADDRESSES.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getUserPostCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: tipsReceived } = useReadContract({
    address: CONTRACT_ADDRESSES.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsReceived',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    data: hash,
    isPending: isClaiming,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (secondsRemaining !== undefined) {
      setCooldownRemaining(Number(secondsRemaining));
    }
  }, [secondsRemaining]);

  // Countdown interval
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          refetchCanClaim();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const formatCooldown = (secs) => {
    if (secs <= 0) return 'Ready to Claim';
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClaimReward = async () => {
    if (!address) {
      toast.error('Connect wallet first!');
      return;
    }

    try {
      toast.loading('Confirming claim in wallet...', { id: 'claim-reward' });
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.RewardDistributor,
        abi: REWARD_DISTRIBUTOR_ABI,
        functionName: 'claimReward',
      });

      toast.loading('Distributing $XMS on Base Sepolia...', { id: 'claim-reward' });
      await new Promise((r) => setTimeout(r, 3500));

      toast.success('🎉 $XMS Rewards successfully claimed and transferred to your wallet!', {
        id: 'claim-reward',
      });

      refetchPending();
      refetchCanClaim();
      refetchTimer();
      refetchTotalClaimed();

    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Claim failed', { id: 'claim-reward' });
    }
  };

  const claimableFormatted = pendingReward !== undefined 
    ? parseFloat(formatUnits(pendingReward, 18)).toFixed(2) 
    : '0.00';

  const totalClaimedFormatted = totalClaimed !== undefined 
    ? parseFloat(formatUnits(totalClaimed, 18)).toFixed(2) 
    : '0.00';

  return (
    <div className="min-h-screen flex flex-col bg-[#12151C] text-[#ECEDEF]">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-[#1B1F29] border border-[#282D3B] p-6 rounded-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Gift className="w-6 h-6 text-[#3FA796]" />
              <h1 className="font-grotesk font-bold text-2xl text-[#ECEDEF]">
                SocialFi Rewards Hub
              </h1>
            </div>
            <p className="text-xs font-mono text-[#8B92A3] mt-1">
              Earn $XMS utility tokens via daily check-in, broadcasting insights, and receiving USDT tips
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#12151C] border border-[#282D3B] px-3.5 py-2 rounded-lg font-mono text-xs text-[#8B92A3]">
              Lifetime Claimed: <strong className="text-[#3FA796]">{totalClaimedFormatted} $XMS</strong>
            </div>
          </div>
        </div>

        {/* Claim Card Hero Banner */}
        <div className="bg-gradient-to-br from-[#1B1F29] via-[#1B1F29] to-[#12151C] border border-[#3FA796]/40 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Col - Balance & Token Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3FA796]/10 border border-[#3FA796]/30 text-xs font-mono text-[#3FA796]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Base Sepolia Reward Pool</span>
              </div>

              <div>
                <div className="text-xs font-mono text-[#8B92A3] uppercase tracking-wider">
                  Available to Claim Now
                </div>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#3FA796] tracking-tight">
                    {claimableFormatted}
                  </span>
                  <span className="font-grotesk text-xl font-bold text-[#ECEDEF]">
                    $XMS
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#8B92A3] font-sans max-w-md leading-relaxed">
                Includes 5.0 $XMS daily check-in quota + 10.0 $XMS per on-chain post + 0.1 $XMS per 1.0 mUSDT received in tips.
              </p>
            </div>

            {/* Right Col - Claim Button & Cooldown */}
            <div className="lg:col-span-5 bg-[#12151C]/90 border border-[#282D3B] p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
              
              {/* Cooldown Status Badge */}
              <div className="flex items-center space-x-2 font-mono text-xs">
                <Clock className="w-4 h-4 text-[#8B92A3]" />
                <span className="text-[#8B92A3]">Cooldown:</span>
                <span className={`font-bold ${cooldownRemaining > 0 ? 'text-[#E8A33D]' : 'text-[#3FA796]'}`}>
                  {formatCooldown(cooldownRemaining)}
                </span>
              </div>

              {/* Claim Button */}
              <button
                onClick={handleClaimReward}
                disabled={!isConnected || !isEligibleToClaim || isClaiming || isConfirming || cooldownRemaining > 0}
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-[#3ED6C4]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isClaiming || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#12151C]" />
                    <span>Claiming Tokens...</span>
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Cooldown Active</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Claim {claimableFormatted} $XMS</span>
                  </>
                )}
              </button>

              <div className="text-[11px] font-mono text-[#656C7D]">
                Enforces 24h cooldown cycle per wallet address
              </div>
            </div>

          </div>
        </div>

        {/* Quests & Earning Breakdown */}
        <div className="bg-[#1B1F29] border border-[#282D3B] rounded-xl p-6 shadow-xl">
          <div className="ledger-border-b pb-4 mb-4">
            <h2 className="font-grotesk font-bold text-lg text-[#ECEDEF] flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#3ED6C4]" />
              <span>Reward Earning Quests</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Quest 1 */}
            <div className="bg-[#10131A] border border-[#282D3B] p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8B92A3]">Daily Check-in</span>
                <span className="text-[#3FA796] font-bold">+5.0 $XMS</span>
              </div>
              <p className="text-xs text-[#ECEDEF] font-sans">
                Claim rewards once every 24 hours to automatically collect your base activity reward.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#3FA796] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Base Daily Allocation</span>
              </div>
            </div>

            {/* Quest 2 */}
            <div className="bg-[#10131A] border border-[#282D3B] p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8B92A3]">Broadcast Insights</span>
                <span className="text-[#3FA796] font-bold">+10.0 $XMS / Post</span>
              </div>
              <p className="text-xs text-[#ECEDEF] font-sans">
                Publish verified updates on the core smart contract. Each broadcast earns 10 $XMS.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#8B92A3]">
                Your Posts: <strong className="text-[#ECEDEF]">{userPostsCount ? userPostsCount.toString() : '0'}</strong>
              </div>
            </div>

            {/* Quest 3 */}
            <div className="bg-[#10131A] border border-[#282D3B] p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8B92A3]">Creator Tipping Royalty</span>
                <span className="text-[#3FA796] font-bold">+0.1 $XMS / 1 USDT</span>
              </div>
              <p className="text-xs text-[#ECEDEF] font-sans">
                Receive tips in mUSDT from your readers. For every 10 USDT earned, get 1 $XMS bonus.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#8B92A3]">
                Tips Earned: <strong className="text-[#E8A33D]">{tipsReceived !== undefined ? parseFloat(formatUnits(tipsReceived, 6)).toFixed(2) : '0.00'} USDT</strong>
              </div>
            </div>

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
