'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CreatePostModal from '../../components/CreatePostModal';
import FaucetModal from '../../components/FaucetModal';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { getContractAddresses } from '../../contracts/addresses';
import { REWARD_DISTRIBUTOR_ABI, REWARD_TOKEN_ABI, CORE_ABI, TIP_VAULT_ABI } from '../../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { Gift, ShieldCheck, Zap, Clock, Coins, CheckCircle2, AlertCircle, Loader2, Sparkles, Radio } from 'lucide-react';

export default function RewardsPage() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContractAddresses(chain?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Wagmi reads
  const { data: claimableAmount, refetch: refetchClaimable } = useReadContract({
    address: contracts.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'calculatePendingReward',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: canClaimNow, refetch: refetchCanClaim } = useReadContract({
    address: contracts.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: timeRemainingData, refetch: refetchTime } = useReadContract({
    address: contracts.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'timeUntilNextClaim',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: userXmsBalance, refetch: refetchBalance } = useReadContract({
    address: contracts.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: totalClaimedData } = useReadContract({
    address: contracts.RewardDistributor,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'totalRewardsClaimed',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: userPostCount } = useReadContract({
    address: contracts.XMoodStreamCore,
    abi: CORE_ABI,
    functionName: 'getUserPostCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: userTipsReceived } = useReadContract({
    address: contracts.TipVault,
    abi: TIP_VAULT_ABI,
    functionName: 'totalTipsReceived',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Write contract for Claim
  const { data: claimTxHash, writeContract, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isWaitingTx, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  const handleClaim = () => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!canClaimNow) {
      toast.error('Claim cooldown active (24 hours between claims)');
      return;
    }

    writeContract({
      address: contracts.RewardDistributor,
      abi: REWARD_DISTRIBUTOR_ABI,
      functionName: 'claimReward',
    });
  };

  useEffect(() => {
    if (isClaimSuccess) {
      toast.success('Rewards claimed successfully');
      refetchClaimable();
      refetchCanClaim();
      refetchTime();
      refetchBalance();
    }
  }, [isClaimSuccess, refetchClaimable, refetchCanClaim, refetchTime, refetchBalance]);

  // Countdown timer calculation
  useEffect(() => {
    if (timeRemainingData) {
      let seconds = Number(timeRemainingData);
      setCountdown(seconds);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            refetchCanClaim();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemainingData, refetchCanClaim]);

  const formatCountdown = (secs) => {
    if (!secs || secs <= 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const claimableFormatted = claimableAmount
    ? parseFloat(formatUnits(claimableAmount, 18)).toFixed(2)
    : '0.00';

  const balanceFormatted = userXmsBalance
    ? parseFloat(formatUnits(userXmsBalance, 18)).toFixed(2)
    : '0.00';

  const totalClaimedFormatted = totalClaimedData
    ? parseFloat(formatUnits(totalClaimedData, 18)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen flex flex-col bg-base text-main selection:bg-gold selection:text-base">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Telemetry */}
        <div className="pb-6 border-b border-line">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-main">
            Activity Rewards ($XMS)
          </h1>
          <p className="text-sub text-xs mt-0.5">
            Claimable daily reward allocation based on on-chain posting and received tips.
          </p>
        </div>

        {/* Claim Vault Card */}
        <div className="mt-6 p-6 rounded-xl bg-surface border border-line space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-sub uppercase tracking-wider">
                Pending Reward Allocation
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="font-mono text-4xl font-extrabold text-glacier tracking-tight">
                  {claimableFormatted}
                </span>
                <span className="font-display text-lg font-bold text-main">
                  $XMS
                </span>
              </div>
            </div>

            <div>
              {canClaimNow ? (
                <button
                  onClick={handleClaim}
                  disabled={isClaimPending || isWaitingTx || !isConnected || parseFloat(claimableFormatted) <= 0}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gold hover:bg-gold-hover disabled:opacity-50 text-base font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  {isClaimPending || isWaitingTx ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim Rewards</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-elevated border border-line text-center sm:text-right font-mono">
                  <div className="text-[10px] text-sub uppercase">Next Claim In</div>
                  <div className="text-sm font-bold text-main mt-0.5">
                    {formatCountdown(countdown)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reward Formula Breakdown */}
          <div className="pt-4 border-t border-line space-y-2">
            <div className="text-xs font-display font-semibold text-main">
              Reward Distribution Formula
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-base border border-line">
                <span className="text-sub">Base Daily:</span> <strong className="text-main">5.0 $XMS</strong>
              </div>
              <div className="p-2.5 rounded bg-base border border-line">
                <span className="text-sub">Per Broadcast:</span> <strong className="text-main">+10.0 $XMS</strong>
              </div>
              <div className="p-2.5 rounded bg-base border border-line">
                <span className="text-sub">Per 1 USDT Tip:</span> <strong className="text-main">+0.1 $XMS</strong>
              </div>
            </div>
          </div>

        </div>

        {/* User Telemetry Overview */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="p-4 rounded-xl bg-surface border border-line">
            <div className="text-[11px] font-mono text-sub uppercase">Wallet Balance</div>
            <div className="text-lg font-mono font-bold text-main mt-1">
              {balanceFormatted} <span className="text-xs font-normal text-sub">XMS</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-line">
            <div className="text-[11px] font-mono text-sub uppercase">Total Claimed</div>
            <div className="text-lg font-mono font-bold text-glacier mt-1">
              {totalClaimedFormatted} <span className="text-xs font-normal text-sub">XMS</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-line">
            <div className="text-[11px] font-mono text-sub uppercase">Posts Authored</div>
            <div className="text-lg font-mono font-bold text-main mt-1">
              {userPostCount ? Number(userPostCount) : 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-line">
            <div className="text-[11px] font-mono text-sub uppercase">Tips Received</div>
            <div className="text-lg font-mono font-bold text-gold mt-1">
              {userTipsReceived ? parseFloat(formatUnits(userTipsReceived, 6)).toFixed(1) : '0.0'} <span className="text-xs font-normal text-sub">USDT</span>
            </div>
          </div>

        </div>

        {/* Protocol Rules Accordion */}
        <div className="mt-6 p-5 rounded-xl bg-surface border border-line space-y-3">
          <div className="flex items-center space-x-2 text-xs font-display font-semibold text-main">
            <ShieldCheck className="w-4 h-4 text-glacier" />
            <span>Distribution Rules</span>
          </div>

          <ul className="space-y-2 text-xs text-sub leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0"></span>
              <span><strong>24-Hour Cooldown:</strong> Each wallet can claim rewards once every 24 hours to prevent spam farming.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0"></span>
              <span><strong>Cumulative Activity:</strong> Posts authored and tips received during the cooldown accumulate automatically into your next claim.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0"></span>
              <span><strong>Non-Dilutive Minting:</strong> Rewards are minted directly from <code className="font-mono text-main">RewardDistributor.sol</code> to your connected address.</span>
            </li>
          </ul>
        </div>

      </main>

      <Footer />

      {/* Modals */}
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
