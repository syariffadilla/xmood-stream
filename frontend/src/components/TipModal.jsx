'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddresses } from '../contracts/addresses';
import { MOCK_USDT_ABI, TIP_VAULT_ABI } from '../contracts/abis';
import { parseUnits, formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { X, Coins, Check, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const TIP_PRESETS = ['1', '5', '10', '25', '50'];

export default function TipModal({ isOpen, onClose, post }) {
  const { address, isConnected, chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);

  const [tipAmount, setTipAmount] = useState('5');
  const [step, setStep] = useState('idle'); // 'idle' | 'approving' | 'tipping'

  // Read user USDT balance
  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: contracts.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isOpen },
  });

  // Read allowance for TipVault
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'allowance',
    args: address && contracts.TipVault ? [address, contracts.TipVault] : undefined,
    query: { enabled: !!address && isOpen },
  });

  // Write contract hook
  const { data: txHash, writeContract, isPending: isWritePending, error: writeError, reset } = useWriteContract();
  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxSuccess) {
      if (step === 'approving') {
        toast.success('USDT allowance approved');
        refetchAllowance();
        setStep('idle');
        reset();
      } else if (step === 'tipping') {
        toast.success(`Tip of ${tipAmount} USDT sent to author`);
        refetchBalance();
        setStep('idle');
        reset();
        onClose();
      }
    }
  }, [isTxSuccess, step, tipAmount, refetchAllowance, refetchBalance, reset, onClose]);

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.shortMessage || 'Transaction failed');
      setStep('idle');
    }
  }, [writeError]);

  if (!isOpen || !post) return null;

  const tipAmountNumber = parseFloat(tipAmount) || 0;
  const parsedTipAmount = tipAmountNumber > 0 ? parseUnits(tipAmount, 6) : 0n;
  const hasAllowance = allowance !== undefined && allowance >= parsedTipAmount && parsedTipAmount > 0n;

  const creatorShare = (tipAmountNumber * 0.95).toFixed(2);
  const protocolShare = (tipAmountNumber * 0.05).toFixed(2);

  const handleApprove = () => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    setStep('approving');
    writeContract({
      address: contracts.MockUSDT,
      abi: MOCK_USDT_ABI,
      functionName: 'approve',
      args: [contracts.TipVault, parseUnits('100000', 6)],
    });
  };

  const handleSendTip = () => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    if (tipAmountNumber <= 0) {
      toast.error('Enter a valid tip amount');
      return;
    }
    if (usdtBalance !== undefined && usdtBalance < parsedTipAmount) {
      toast.error('Insufficient mUSDT balance. Get testnet tokens from Faucet.');
      return;
    }

    setStep('tipping');
    writeContract({
      address: contracts.TipVault,
      abi: TIP_VAULT_ABI,
      functionName: 'tipPost',
      args: [BigInt(post.id), post.author, parsedTipAmount],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-surface border border-line p-6 space-y-4 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display font-bold text-base text-main">
              Send USDT Tip
            </h2>
            <p className="text-[11px] font-mono text-sub mt-0.5">
              Direct settlement to Post #{post.id} ({post.author.slice(0, 6)}...{post.author.slice(-4)})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sub hover:text-main hover:bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-sub">
            <span>Tip Amount (mUSDT)</span>
            <span>
              Balance: {usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(1) : '0.0'} USDT
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full bg-base border border-line rounded-lg py-2.5 px-3 pr-16 text-lg font-mono font-bold text-main focus:outline-none focus:border-gold transition-colors"
            />
            <span className="absolute right-3 top-3 text-xs font-mono text-sub">
              mUSDT
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-1.5 pt-1">
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTipAmount(preset)}
                className={`flex-1 py-1.5 rounded text-xs font-mono transition-colors ${
                  tipAmount === preset
                    ? 'bg-elevated text-gold border border-gold/40 font-semibold'
                    : 'bg-base border border-line text-sub hover:text-main'
                }`}
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* 95/5 Split Voucher Stamp */}
        <div className="p-3.5 rounded-lg bg-base border border-line space-y-2 font-mono text-xs">
          <div className="text-[10px] text-sub uppercase tracking-wider">
            Smart Contract Settlement Split
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sub">Creator Share (95%):</span>
            <strong className="text-gold font-bold">+{creatorShare} USDT</strong>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-sub">Protocol Treasury (5%):</span>
            <span className="text-sub">+{protocolShare} USDT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-line flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-elevated border border-line text-sub hover:text-main text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          {!hasAllowance ? (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isWritePending || isWaitingTx || !isConnected || tipAmountNumber <= 0}
              className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-hover disabled:opacity-50 text-base font-semibold text-xs transition-colors flex items-center space-x-1.5"
            >
              {step === 'approving' && (isWritePending || isWaitingTx) ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Approving USDT...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve USDT</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendTip}
              disabled={isWritePending || isWaitingTx || !isConnected || tipAmountNumber <= 0}
              className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-hover disabled:opacity-50 text-base font-semibold text-xs transition-colors flex items-center space-x-1.5"
            >
              {step === 'tipping' && (isWritePending || isWaitingTx) ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Tip...</span>
                </>
              ) : (
                <>
                  <Coins className="w-3.5 h-3.5" />
                  <span>Confirm Tip ({tipAmount} USDT)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
