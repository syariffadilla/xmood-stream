'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { X, Coins, CheckCircle, Loader2, ShieldAlert, Clock, Globe } from 'lucide-react';

export default function FaucetModal({ isOpen, onClose, onMintSuccess }) {
  const [isMinting, setIsMinting] = useState(false);
  const [canClaim, setCanClaim] = useState(true);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [clientIp, setClientIp] = useState('');
  const { address, isConnected } = useAccount();

  // Check IP rate-limit status from API
  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/faucet?address=${address || ''}`);
      const data = await res.json();
      setCanClaim(data.canClaim);
      setRemainingSecs(data.remainingSeconds || 0);
      if (data.clientIp) setClientIp(data.clientIp);
    } catch (e) {
      console.error('Failed to check faucet status:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
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

  const handleMint = async () => {
    if (!address) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    try {
      toast.loading('Requesting 100 mUSDT from IP-rate limited faucet...', { id: 'faucet-mint' });

      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Faucet claim failed');
      }

      toast.success('🎉 100 mUSDT successfully credited to your wallet (Gasless)!', { id: 'faucet-mint' });
      setCanClaim(false);
      setRemainingSecs(24 * 3600);
      if (onMintSuccess) onMintSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Faucet claim failed', { id: 'faucet-mint' });
      checkStatus();
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#1B1F29] border border-[#282D3B] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282D3B] bg-[#10131A]/60">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-[#E8A33D]" />
            <h3 className="font-grotesk font-bold text-base text-[#ECEDEF]">
              Testnet mUSDT Faucet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B92A3] hover:text-[#ECEDEF] p-1 rounded-md hover:bg-[#272A31] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/30 flex items-center justify-center mx-auto">
            <Coins className="w-8 h-8 text-[#E8A33D]" />
          </div>

          <div>
            <h4 className="font-grotesk font-bold text-lg text-[#ECEDEF]">
              Get Free Testnet USDT
            </h4>
            <p className="text-xs text-[#8B92A3] font-sans mt-1">
              Mint 100 Mock USDT instantly to test tipping creators on Base Sepolia.
            </p>
          </div>

          {/* Rate limit badge & IP notice */}
          <div className="bg-[#12151C] border border-[#282D3B] p-3 rounded-lg text-xs font-mono space-y-1.5 text-left">
            <div className="flex justify-between text-[#ECEDEF]">
              <span className="text-[#8B92A3]">Allowance:</span>
              <span className="font-bold text-[#E8A33D]">100.00 mUSDT</span>
            </div>
            <div className="flex justify-between text-[#8B92A3] text-[11px] pt-1 border-t border-[#282D3B]">
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#3ED6C4]" />
                <span>Limit Policy:</span>
              </span>
              <span className="text-[#3ED6C4] font-semibold">1x / 24h per IP</span>
            </div>
            {clientIp && (
              <div className="text-[10px] text-[#656C7D] text-right">
                IP: {clientIp}
              </div>
            )}
          </div>

          {/* Cooldown Alert if locked */}
          {!canClaim && remainingSecs > 0 && (
            <div className="p-3 rounded-lg bg-[#93000a]/20 border border-[#93000a]/50 text-xs font-mono text-[#ffb4ab] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#ffb4ab] shrink-0" />
              <div className="text-left text-[11px]">
                <span>IP Cooldown active:</span>
                <strong className="block text-white font-bold">{formatRemainingTime(remainingSecs)}</strong>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleMint}
            disabled={isMinting || !isConnected || (!canClaim && remainingSecs > 0)}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#E8A33D] hover:bg-[#ffb44a] text-[#12151C] font-grotesk font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#E8A33D]/20"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#12151C]" />
                <span>Distributing 100 mUSDT...</span>
              </>
            ) : !canClaim && remainingSecs > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Claimed (Cooldown 24h)</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>Claim 100 mUSDT (Gasless)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
