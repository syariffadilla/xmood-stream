'use client';

import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { MOCK_USDT_ABI, TIP_VAULT_ABI } from '../contracts/abis';
import { formatUnits, parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { X, Heart, Shield, Loader2, DollarSign } from 'lucide-react';

export default function TipModal({ isOpen, onClose, post, onTipSuccess }) {
  const [tipAmount, setTipAmount] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);
  const { address } = useAccount();

  // Read current user mUSDT balance
  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read current allowance for TipVault
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.TipVault] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();

  if (!isOpen || !post) return null;

  const parsedAmount = parseFloat(tipAmount) || 0;
  const creatorCut = (parsedAmount * 0.95).toFixed(2);
  const treasuryCut = (parsedAmount * 0.05).toFixed(2);
  const amountInUnits = parsedAmount > 0 ? parseUnits(tipAmount, 6) : 0n;

  const presets = ['1', '5', '10', '25', '50'];

  const handleSendTip = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (parsedAmount <= 0) {
      toast.error('Please enter a valid tip amount');
      return;
    }

    if (usdtBalance && usdtBalance < amountInUnits) {
      toast.error('Insufficient mUSDT balance! Use the Faucet button to get test tokens.');
      return;
    }

    if (post.author.toLowerCase() === address.toLowerCase()) {
      toast.error('You cannot tip your own post!');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Check Allowance & Approve if necessary
      const currentAllowance = allowance || 0n;
      if (currentAllowance < amountInUnits) {
        toast.loading('Step 1/2: Approving mUSDT spend...', { id: 'tip-process' });
        const approveTx = await writeContractAsync({
          address: CONTRACT_ADDRESSES.MockUSDT,
          abi: MOCK_USDT_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.TipVault, parseUnits('1000000', 6)], // approve large allowance for seamless UX
        });
        toast.loading('Mining approval on-chain...', { id: 'tip-process' });
        await new Promise((r) => setTimeout(r, 3000));
        await refetchAllowance();
      }

      // Step 2: Tip the post via TipVault
      toast.loading(`Step 2/2: Sending ${tipAmount} mUSDT tip...`, { id: 'tip-process' });
      const tipTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.TipVault,
        abi: TIP_VAULT_ABI,
        functionName: 'tipPost',
        args: [BigInt(post.id), post.author, amountInUnits],
      });

      toast.loading('Confirming tip transaction...', { id: 'tip-process' });
      await new Promise((r) => setTimeout(r, 3500));

      toast.success(`Successfully sent ${tipAmount} mUSDT tip to ${post.author.slice(0, 6)}...${post.author.slice(-4)}!`, {
        id: 'tip-process',
      });

      refetchBalance();
      if (onTipSuccess) onTipSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Tip transaction failed', { id: 'tip-process' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1B1F29] border border-[#282D3B] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282D3B] bg-[#10131A]/60">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#E8A33D]" />
            <h3 className="font-grotesk font-bold text-base text-[#ECEDEF]">
              Tip Creator (Post #{post.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B92A3] hover:text-[#ECEDEF] p-1 rounded-md hover:bg-[#272A31] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Creator Details */}
          <div className="bg-[#12151C] border border-[#282D3B] p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#272A31] flex items-center justify-center font-mono text-xs text-[#3ED6C4] font-bold">
                {post.author.slice(2, 4).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-[#8B92A3] font-mono">Recipient Creator</div>
                <div className="text-xs font-mono text-[#ECEDEF]">
                  {post.author.slice(0, 6)}...{post.author.slice(-4)}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#E8A33D]/10 text-[#E8A33D] font-mono text-xs font-semibold">
              95% Direct
            </span>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-mono text-[#8B92A3] uppercase tracking-wider mb-2">
              Select Tip Amount (mUSDT)
            </label>
            
            {/* Presets */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTipAmount(preset)}
                  className={`py-1.5 rounded-md font-mono text-xs font-semibold transition-all border ${
                    tipAmount === preset
                      ? 'bg-[#E8A33D] text-[#12151C] border-[#E8A33D]'
                      : 'bg-[#12151C] border-[#282D3B] text-[#ECEDEF] hover:border-[#E8A33D]/50'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B92A3]">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Custom Amount"
                className="w-full bg-[#12151C] border border-[#282D3B] focus:border-[#E8A33D] rounded-lg pl-8 pr-16 py-2.5 text-sm font-mono text-[#ECEDEF] outline-none transition-colors"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-mono text-[#8B92A3]">
                mUSDT
              </span>
            </div>
          </div>

          {/* Value Split Breakdown */}
          <div className="bg-[#12151C]/60 border border-[#282D3B] rounded-lg p-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[#8B92A3]">
              <span>Creator Allocation (95%):</span>
              <span className="text-[#ECEDEF] font-semibold">{creatorCut} mUSDT</span>
            </div>
            <div className="flex justify-between text-[#8B92A3]">
              <span>Treasury Protocol Fee (5%):</span>
              <span className="text-[#8B92A3]">{treasuryCut} mUSDT</span>
            </div>
            <div className="pt-1.5 border-t border-[#282D3B] flex justify-between text-[#ECEDEF] font-bold">
              <span>Total Tip:</span>
              <span className="text-[#E8A33D]">{parsedAmount.toFixed(2)} mUSDT</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSendTip}
            disabled={isProcessing || parsedAmount <= 0}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#E8A33D] hover:bg-[#ffb44a] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E8A33D]/20"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#12151C]" />
                <span>Confirming Tip...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-current" />
                <span>Send {parsedAmount > 0 ? `${parsedAmount} mUSDT` : ''} Tip</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
