'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddresses } from '../contracts/addresses';
import { CORE_ABI } from '../contracts/abis';
import toast from 'react-hot-toast';
import { X, Send, Image as ImageIcon, Loader2, AlertCircle, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'alpha', label: 'Alpha', tag: '#Alpha' },
  { id: 'depin', label: 'AI & DePIN', tag: '#DePIN' },
  { id: 'defi', label: 'DeFi & Yield', tag: '#DeFi' },
  { id: 'nft', label: 'NFT & Digital Art', tag: '#NFT' },
  { id: 'socialfi', label: 'SocialFi', tag: '#SocialFi' },
  { id: 'meme', label: 'Meme & Community', tag: '#Meme' },
];

export default function CreatePostModal({ isOpen, onClose }) {
  const { address, isConnected, chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);

  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('#Alpha');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Broadcasted to on-chain ledger');
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      reset();
      onClose();
    }
  }, [isSuccess, onClose, reset]);

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.shortMessage || 'Failed to submit broadcast');
    }
  }, [writeError]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!content.trim()) {
      toast.error('Write a message to broadcast');
      return;
    }

    let payload = `${selectedTag} ${content.trim()}`;
    if (imageUrl.trim()) {
      payload += ` [media:${imageUrl.trim()}]`;
    }

    writeContract({
      address: contracts.XMoodStreamCore,
      abi: CORE_ABI,
      functionName: 'createPost',
      args: [payload],
    });
  };

  const charCount = content.length;
  const maxChars = 280;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-surface border border-line p-6 space-y-4 shadow-xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display font-bold text-base text-main">
              New On-Chain Broadcast
            </h2>
            <p className="text-[11px] font-mono text-sub mt-0.5">
              Writes directly to {contracts.chainName} Core Contract
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sub hover:text-main hover:bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Category Tag Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-sub uppercase">
              Select Stream Tag
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedTag(cat.tag)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    selectedTag === cat.tag
                      ? 'bg-elevated text-gold border border-gold/40 font-semibold'
                      : 'text-sub hover:text-main hover:bg-elevated'
                  }`}
                >
                  {cat.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono text-sub">
              <span>Broadcast Content</span>
              <span className={charCount > maxChars - 20 ? 'text-gold' : 'text-sub'}>
                {charCount}/{maxChars}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What alpha or insight are you broadcasting?"
              rows={4}
              maxLength={maxChars}
              className="w-full bg-base border border-line rounded-lg p-3 text-sm text-main placeholder-sub/60 focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          {/* Image URL Input / Toggle */}
          <div className="space-y-2">
            {!showImageInput && !imageUrl ? (
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                className="text-xs font-mono text-sub hover:text-gold flex items-center space-x-1.5 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Attach image URL</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-base border border-line rounded-lg px-3 py-2 text-xs text-main placeholder-sub/60 focus:outline-none focus:border-gold font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setShowImageInput(false);
                    }}
                    className="p-2 rounded-lg bg-elevated border border-line text-sub hover:text-main"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {imageUrl && (
                  <div className="rounded-lg border border-line overflow-hidden max-h-40 bg-base">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => toast.error('Invalid image URL')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="p-3 rounded-lg bg-elevated border border-line text-[11px] font-mono text-sub">
            💡 Posts are permanently recorded to the on-chain ledger. Tips sent to this post route 95% straight to your address.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-elevated border border-line text-sub hover:text-main text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending || isWaiting || !content.trim() || !isConnected}
              className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-hover disabled:opacity-50 text-base font-semibold text-xs transition-colors flex items-center space-x-1.5"
            >
              {isPending || isWaiting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Transaction...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Post</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
