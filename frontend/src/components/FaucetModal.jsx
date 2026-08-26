'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { MOCK_USDT_ABI } from '../contracts/abis';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { X, Coins, CheckCircle, Loader2, ShieldAlert, Clock, Globe, Zap } from 'lucide-react';

export default function FaucetModal({ isOpen, onClose, onMintSuccess }) {
  const [isMinting, setIsMinting] = useState(false);
  const [canClaim, setCanClaim] = useState(true);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [clientIp, setClientIp] = useState('');
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Check IP rate-limit status from API
  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/faucet?address=${address || ''}`);
      if (res.ok) {
        const data = await res.json();
        setCanClaim(data.canClaim);
        setRemainingSecs(data.remainingSeconds || 0);
        if (data.clientIp) setClientIp(data.clientIp);
      }
    } catch (e) {
      console.warn('Faucet status check fallback:', e);
    }
  };

  useEffect(() => {
    if (isOpen && address) {
      checkStatus();
    }
  }, [isOpen, address]);

  // Countdown timer if locked
  useEffect(() => {
    if (remainingSecs <= 0) return;
    const timer = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev <= 1) {
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSecs]);

  if (!isOpen) return null;

  const formatRemainingTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  // Direct On-Chain Minting (100% reliable fallback)
  const handleDirectMint = async () => {
    if (!address) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    try {
      toast.loading('Minting 100 mUSDT on BOT Chain Testnet...', { id: 'faucet-mint' });

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.MockUSDT,
        abi: MOCK_USDT_ABI,
        functionName: 'mint',
        args: [address, parseUnits('100', 6)],
      });

      toast.success('🎉 100 mUSDT minted successfully on BOT Chain!', { id: 'faucet-mint' });
      if (onMintSuccess) onMintSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Direct mint failed', { id: 'faucet-mint' });
    } finally {
      setIsMinting(false);
    }
  };

  // Gasless API Claim
  const handleGaslessClaim = async () => {
    if (!address) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    try {
      toast.loading('Requesting 100 mUSDT from server faucet...', { id: 'faucet-mint' });

      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server faucet unavailable. Try Direct Mint.');
      }

      toast.success('🎉 100 mUSDT successfully credited to your wallet (Gasless)!', { id: 'faucet-mint' });
      setCanClaim(false);
      setRemainingSecs(24 * 3600);
      if (onMintSuccess) onMintSuccess();
      onClose();
    } catch (err) {
      console.warn('Gasless faucet notice:', err.message);
      toast.error(err.message || 'Server claim failed. Please use Direct Mint.', { id: 'faucet-mint' });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#0E131F] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#090C15]/80">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-grotesk font-bold text-base text-[#F3F4F6]">
              Testnet mUSDT Faucet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-[#182032] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#F59E0B]/10">
            <Coins className="w-8 h-8 text-[#F59E0B]" />
          </div>

          <div>
            <h4 className="font-grotesk font-bold text-lg text-[#F3F4F6]">
              Get Free Testnet USDT
            </h4>
            <p className="text-xs text-[#94A3B8] font-sans mt-1">
              Mint 100 Mock USDT instantly to test tipping creators on {CONTRACT_ADDRESSES.chainName}.
            </p>
          </div>

          {/* Rate limit badge & IP notice */}
          <div className="bg-[#090C15] border border-[#1E293B] p-3.5 rounded-xl text-xs font-mono space-y-2 text-left">
            <div className="flex justify-between text-[#F3F4F6]">
              <span className="text-[#94A3B8]">Allowance:</span>
              <span className="font-bold text-[#F59E0B]">100.00 mUSDT</span>
            </div>
            <div className="flex justify-between text-[#94A3B8] text-[11px] pt-1.5 border-t border-[#1E293B]">
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#00F5A0]" />
                <span>Network:</span>
              </span>
              <span className="text-[#00F5A0] font-semibold">{CONTRACT_ADDRESSES.chainName}</span>
            </div>
          </div>

          {/* Cooldown Alert if locked */}
          {!canClaim && remainingSecs > 0 && (
            <div className="bg-[#182032]/80 border border-[#F59E0B]/30 p-3 rounded-xl flex items-center space-x-2.5 text-left text-xs font-mono text-[#F59E0B]">
              <Clock className="w-4 h-4 shrink-0 text-[#F59E0B]" />
              <div>
                <p className="font-bold">Gasless Faucet Cooldown</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Resets in: <span className="text-[#F3F4F6] font-semibold">{formatRemainingTime(remainingSecs)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDirectMint}
              disabled={isMinting || !isConnected}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#6366F1] text-[#090C15] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#00F5A0]/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              {isMinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#090C15]" />
                  <span>Processing Mint...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-[#090C15]" />
                  <span>Mint 100 mUSDT Directly</span>
                </>
              )}
            </button>

            {canClaim && (
              <button
                onClick={handleGaslessClaim}
                disabled={isMinting || !isConnected}
                className="w-full py-2.5 rounded-xl bg-[#090C15] border border-[#1E293B] hover:border-[#00F5A0]/50 text-[#94A3B8] hover:text-[#F3F4F6] font-grotesk font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00F5A0]" />
                <span>Try Gasless Server Claim</span>
              </button>
            )}
          </div>

          {!isConnected && (
            <p className="text-[11px] font-mono text-[#F59E0B]">
              ⚠️ Please connect your Web3 wallet first to receive testnet tokens.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
