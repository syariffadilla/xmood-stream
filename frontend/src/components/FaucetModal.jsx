'use client';

import React, { useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddresses } from '../contracts/addresses';
import { MOCK_USDT_ABI } from '../contracts/abis';
import { parseUnits, formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { X, Coins, Loader2, Check, ExternalLink, ShieldCheck } from 'lucide-react';

export default function FaucetModal({ isOpen, onClose }) {
  const { address, isConnected, chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);

  // Read current balance
  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: contracts.MockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isOpen },
  });

  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Minted 500 mUSDT to your wallet');
      refetchBalance();
      reset();
      onClose();
    }
  }, [isSuccess, refetchBalance, reset, onClose]);

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.shortMessage || 'Failed to mint tokens');
    }
  }, [writeError]);

  if (!isOpen) return null;

  const handleMint = () => {
    if (!isConnected || !address) {
      toast.error('Connect your wallet first');
      return;
    }

    writeContract({
      address: contracts.MockUSDT,
      abi: MOCK_USDT_ABI,
      functionName: 'mint',
      args: [address, parseUnits('500', 6)],
    });
  };

  const balanceFormatted = usdtBalance !== undefined
    ? parseFloat(formatUnits(usdtBalance, 6)).toFixed(1)
    : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-surface border border-line p-6 space-y-4 shadow-xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display font-bold text-base text-main">
              mUSDT Token Faucet
            </h2>
            <p className="text-[11px] font-mono text-sub mt-0.5">
              Testnet tokens for tipping creators on {contracts.chainName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sub hover:text-main hover:bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Status */}
        <div className="p-4 rounded-lg bg-base border border-line space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sub">Current Balance:</span>
            <strong className="text-gold font-bold text-sm">{balanceFormatted} USDT</strong>
          </div>
          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-line">
            <span className="text-sub">Faucet Quota:</span>
            <span className="text-main font-semibold">+500.0 mUSDT</span>
          </div>
        </div>

        <p className="text-xs text-sub leading-relaxed">
          Minting sends 500 mock USDT (6 decimals) directly from <code className="font-mono text-main">MockUSDT.sol</code> to your address so you can test tipping and reward distributions.
        </p>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-line flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-elevated border border-line text-sub hover:text-main text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleMint}
            disabled={isPending || isWaiting || !isConnected}
            className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-hover disabled:opacity-50 text-base font-semibold text-xs transition-colors flex items-center space-x-1.5"
          >
            {isPending || isWaiting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Minting Tokens...</span>
              </>
            ) : (
              <>
                <Coins className="w-3.5 h-3.5" />
                <span>Mint 500 mUSDT</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
