'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CORE_ABI, REWARD_TOKEN_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { X, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const { address, isConnected } = useAccount();

  // Read XMS balance
  const { data: xmsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardToken,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    data: hash,
    isPending: isSubmitting,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter content to broadcast');
      return;
    }

    try {
      toast.loading('Confirming transaction in wallet...', { id: 'create-post' });

      // Call createPost with content string / hash
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'createPost',
        args: [content.trim()],
      });

      toast.loading('Mining transaction on Base Sepolia...', { id: 'create-post' });

      // After dispatch, wait for receipt or notify
      setTimeout(() => {
        toast.success('Post broadcasted successfully!', { id: 'create-post' });
        setContent('');
        if (onPostCreated) onPostCreated();
        onClose();
      }, 3500);

    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Failed to broadcast post', { id: 'create-post' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#1B1F29] border border-[#282D3B] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282D3B] bg-[#10131A]/60">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3ED6C4] animate-pulse"></span>
            <h3 className="font-grotesk font-bold text-base text-[#ECEDEF]">
              Broadcast On-Chain Post
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B92A3] hover:text-[#ECEDEF] p-1 rounded-md hover:bg-[#272A31] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#8B92A3] uppercase tracking-wider mb-2">
              Content / Mood Update (IPFS or Raw Text)
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening? Share thoughts, signals, or alpha to the ledger..."
              className="w-full bg-[#12151C] border border-[#282D3B] focus:border-[#3ED6C4] rounded-lg p-3 text-sm text-[#ECEDEF] placeholder-[#656C7D] outline-none transition-colors resize-none font-sans"
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-1 text-[11px] font-mono text-[#656C7D]">
              <span>On-Chain Storage (Permanent)</span>
              <span>{content.length}/280</span>
            </div>
          </div>

          {/* Reward info box */}
          <div className="bg-[#12151C] border border-[#282D3B] rounded-lg p-3 flex items-start space-x-3 text-xs">
            <Sparkles className="w-4 h-4 text-[#3FA796] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-grotesk font-semibold text-[#3FA796]">
                Earn $XMS on every broadcast
              </span>
              <p className="text-[#8B92A3] text-[11px]">
                Each verified post earns you 10 $XMS reward tokens claimable in the Rewards Hub.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#272A31] hover:bg-[#32353C] text-[#ECEDEF] text-xs font-mono font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isConfirming || !content.trim()}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#3ED6C4] to-[#1E56E0] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#3ED6C4]/20"
            >
              {isSubmitting || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#12151C]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Now</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
