'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CORE_ABI, REWARD_TOKEN_ABI } from '../contracts/abis';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { 
  X, 
  Send, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon, 
  Tag, 
  Smile, 
  Check, 
  Zap,
  Globe
} from 'lucide-react';

const MOOD_CATEGORIES = [
  { id: 'alpha', label: '🚀 Alpha', tag: '#Alpha' },
  { id: 'depin', label: '🤖 AI & DePIN', tag: '#DePIN' },
  { id: 'defi', label: '📈 DeFi & Yield', tag: '#DeFi' },
  { id: 'nft', label: '🎨 NFT & Art', tag: '#NFT' },
  { id: 'meme', label: '🔥 Meme', tag: '#Meme' },
  { id: 'general', label: '💬 General', tag: '#SocialFi' },
];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState('alpha');
  const { address, isConnected } = useAccount();

  const {
    data: hash,
    isPending: isSubmitting,
    writeContractAsync,
  } = useWriteContract();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter content to broadcast');
      return;
    }

    // Pack tag + text + mediaUrl into structured post payload
    let finalPayload = content.trim();
    const tagObj = MOOD_CATEGORIES.find((m) => m.id === selectedTag);
    if (tagObj && !finalPayload.includes(tagObj.tag)) {
      finalPayload = `${tagObj.tag} ${finalPayload}`;
    }
    if (mediaUrl.trim()) {
      finalPayload = `${finalPayload} [media:${mediaUrl.trim()}]`;
    }

    try {
      toast.loading('Confirming transaction in wallet...', { id: 'create-post' });

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.XMoodStreamCore,
        abi: CORE_ABI,
        functionName: 'createPost',
        args: [finalPayload],
      });

      toast.loading('Mining broadcast on BOT Chain...', { id: 'create-post' });

      setTimeout(() => {
        toast.success('🎉 Content published successfully! (+10 $XMS)', { id: 'create-post' });
        setContent('');
        setMediaUrl('');
        setShowMediaInput(false);
        if (onPostCreated) onPostCreated();
        onClose();
      }, 3500);

    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || 'Failed to broadcast post', { id: 'create-post' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0E131F] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#090C15]/80">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0] animate-pulse"></span>
            <h3 className="font-grotesk font-bold text-base text-[#F3F4F6]">
              Creator Studio — Broadcast Stream
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-[#182032] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category / Mood Selector */}
          <div>
            <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
              Select Stream Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedTag(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                    selectedTag === cat.id
                      ? 'bg-[#00F5A0] text-[#090C15] font-bold shadow-md shadow-[#00F5A0]/20'
                      : 'bg-[#090C15] border border-[#1E293B] text-[#94A3B8] hover:text-[#F3F4F6] hover:border-[#00F5A0]/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div>
            <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
              Broadcast Message & Insights
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share alpha, research, analysis, or creative insights to your subscribers..."
              className="w-full bg-[#090C15] border border-[#1E293B] focus:border-[#00F5A0] rounded-xl p-3.5 text-sm text-[#F3F4F6] placeholder-[#64748B] outline-none transition-colors resize-none font-sans"
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-1 text-[11px] font-mono text-[#64748B]">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="text-[#00F5A0] hover:underline flex items-center space-x-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{showMediaInput ? 'Hide Media URL' : '+ Attach Image / Media Link'}</span>
              </button>
              <span>{content.length}/280</span>
            </div>
          </div>

          {/* Media / Image URL attachment */}
          {showMediaInput && (
            <div className="space-y-2 p-3 bg-[#090C15] border border-[#1E293B] rounded-xl animate-in fade-in duration-150">
              <label className="block text-xs font-mono text-[#94A3B8]">
                Image or GIF URL (e.g. IPFS, Unsplash, Imgur, or direct link)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://ipfs.io/..."
                className="w-full bg-[#0E131F] border border-[#1E293B] focus:border-[#00F5A0] rounded-lg px-3 py-2 text-xs font-mono text-[#F3F4F6] outline-none"
              />
              {mediaUrl && (
                <div className="relative rounded-lg overflow-hidden border border-[#1E293B] max-h-40">
                  <img
                    src={mediaUrl}
                    alt="Media preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Creator Reward Benefit */}
          <div className="bg-[#090C15] border border-[#00F5A0]/20 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
            <Sparkles className="w-4 h-4 text-[#00F5A0] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-grotesk font-semibold text-[#00F5A0]">
                Creator Monetization Active
              </span>
              <p className="text-[#94A3B8] text-[11px]">
                Earns +10 $XMS reward tokens immediately + enables direct 95% mUSDT tips from readers.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#090C15] border border-[#1E293B] hover:bg-[#182032] text-[#94A3B8] hover:text-[#F3F4F6] text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#6366F1] text-[#090C15] font-grotesk font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#00F5A0]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#090C15]" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#090C15]" />
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
