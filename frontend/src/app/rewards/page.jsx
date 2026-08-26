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
  TrendingUp,
  ShieldCheck
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
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          refetchCanClaim();
          refetchPending();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining, refetchCanClaim, refetchPending]);

  const handleClaimReward = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!isEligibleToClaim && cooldownRemaining > 0) {
      toast.error('Cooldown active. Please wait 24h between claims.');
      return;
    }

    try {
      toast.loading('Distributing $XMS on BOT Chain...', { id: 'claim-reward' });

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.RewardDistributor,
        abi: REWARD_DISTRIBUTOR_ABI,
        functionName: 'claimReward',
      });

      toast.loading('Waiting for blockchain confirmation...', { id: 'claim-reward' });

      // Refresh on-chain states
      setTimeout(() => {
        refetchPending();
        refetchCanClaim();
        refetchTimer();
        refetchTotalClaimed();
        toast.success('🎉 $XMS Rewards claimed successfully!', { id: 'claim-reward' });
      }, 3500);
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Failed to claim reward', { id: 'claim-reward' });
    }
  };

  const formatCooldown = (secs) => {
    if (secs <= 0) return 'Ready to Claim!';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const claimableFormatted = pendingReward !== undefined ? parseFloat(formatUnits(pendingReward, 18)).toFixed(2) : '5.00';
  const totalClaimedFormatted = totalClaimed !== undefined ? parseFloat(formatUnits(totalClaimed, 18)).toFixed(1) : '0.0';

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
              <Gift className="w-6 h-6 text-[#00F5A0]" />
              <h1 className="font-grotesk font-bold text-2xl text-[#F3F4F6]">
                $XMS Reward Distribution
              </h1>
            </div>
            <p className="text-xs font-mono text-[#94A3B8] mt-1">
              Earn $XMS utility tokens via daily check-in, broadcasting insights, and receiving USDT tips
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#090C15] border border-[#1E293B] px-3.5 py-2 rounded-xl font-mono text-xs text-[#94A3B8]">
              Lifetime Claimed: <strong className="text-[#00F5A0]">{totalClaimedFormatted} $XMS</strong>
            </div>
          </div>
        </div>

        {/* Claim Card Hero Banner */}
        <div className="bg-gradient-to-br from-[#0E131F] via-[#111726] to-[#090C15] border border-[#00F5A0]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Col - Balance & Token Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00F5A0]/10 border border-[#00F5A0]/30 text-xs font-mono text-[#00F5A0]">
                <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
                <span>{CONTRACT_ADDRESSES.chainName} Reward Pool</span>
              </div>

              <div>
                <div className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">
                  Available to Claim Now
                </div>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#00F5A0] tracking-tight">
                    {claimableFormatted}
                  </span>
                  <span className="font-grotesk text-xl font-bold text-[#F3F4F6]">
                    $XMS
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] font-sans max-w-md leading-relaxed">
                Includes 5.0 $XMS daily check-in quota + 10.0 $XMS per on-chain post + 0.1 $XMS per 1.0 mUSDT received in tips.
              </p>
            </div>

            {/* Right Col - Claim Button & Cooldown */}
            <div className="lg:col-span-5 bg-[#090C15]/90 border border-[#1E293B] p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              
              {/* Cooldown Status Badge */}
              <div className="flex items-center space-x-2 font-mono text-xs">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-[#94A3B8]">Cooldown:</span>
                <span className={`font-bold ${cooldownRemaining > 0 ? 'text-[#F59E0B]' : 'text-[#00F5A0]'}`}>
                  {formatCooldown(cooldownRemaining)}
                </span>
              </div>

              {/* Claim Button */}
              <button
                onClick={handleClaimReward}
                disabled={!isConnected || !isEligibleToClaim || isClaiming || isConfirming || cooldownRemaining > 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#6366F1] text-[#090C15] font-grotesk font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-[#00F5A0]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isClaiming || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#090C15]" />
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

              <div className="text-[11px] font-mono text-[#64748B]">
                Enforces 24h cooldown cycle per wallet address
              </div>
            </div>

          </div>
        </div>

        {/* Quests & Earning Breakdown */}
        <div className="bg-[#0E131F] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
          <div className="ledger-border-b pb-4 mb-4">
            <h2 className="font-grotesk font-bold text-lg text-[#F3F4F6] flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#00F5A0]" />
              <span>Reward Earning Quests</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Quest 1 */}
            <div className="bg-[#090C15] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#94A3B8]">Daily Check-in</span>
                <span className="text-[#00F5A0] font-bold">+5.0 $XMS</span>
              </div>
              <p className="text-xs text-[#F3F4F6] font-sans">
                Claim rewards once every 24 hours to automatically collect your base activity reward.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#00F5A0] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Base Daily Allocation</span>
              </div>
            </div>

            {/* Quest 2 */}
            <div className="bg-[#090C15] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#94A3B8]">Broadcast Insights</span>
                <span className="text-[#00F5A0] font-bold">+10.0 $XMS / Post</span>
              </div>
              <p className="text-xs text-[#F3F4F6] font-sans">
                Publish verified updates on the core smart contract. Each broadcast earns 10 $XMS.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#94A3B8]">
                Your Posts: <strong className="text-[#F3F4F6]">{userPostsCount ? userPostsCount.toString() : '0'}</strong>
              </div>
            </div>

            {/* Quest 3 */}
            <div className="bg-[#090C15] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#94A3B8]">Creator Tipping Royalty</span>
                <span className="text-[#00F5A0] font-bold">+0.1 $XMS / 1 USDT</span>
              </div>
              <p className="text-xs text-[#F3F4F6] font-sans">
                Receive tips in mUSDT from your readers. For every 10 USDT earned, get 1 $XMS bonus.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#94A3B8]">
                Tips Earned: <strong className="text-[#F59E0B]">{tipsReceived !== undefined ? parseFloat(formatUnits(tipsReceived, 6)).toFixed(2) : '0.00'} USDT</strong>
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
