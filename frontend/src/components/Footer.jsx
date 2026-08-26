import React from 'react';
import Link from 'next/link';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#282D3B] bg-[#10131A] text-[#8B92A3] py-8 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#ECEDEF] font-grotesk font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-[#3ED6C4]"></span>
              <span>X-MOOD STREAM</span>
            </div>
            <p className="text-[#8B92A3] text-xs font-sans">
              SocialFi Tipping & Rewards protocol on Base Sepolia. Verifiable ledger of micro-posts and tips.
            </p>
          </div>

          <div>
            <h4 className="text-[#ECEDEF] font-grotesk font-semibold text-xs uppercase mb-2">
              Network Specs
            </h4>
            <ul className="space-y-1">
              <li>Chain: <span className="text-[#ECEDEF]">{CONTRACT_ADDRESSES.chainName} ({CONTRACT_ADDRESSES.chainId})</span></li>
              <li>Currency: <span className="text-[#ECEDEF]">BOT / ETH</span></li>
              <li>Tip Token: <span className="text-[#E8A33D]">mUSDT (6 Decimals)</span></li>
              <li>Reward: <span className="text-[#3FA796]">$XMS (18 Decimals)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#ECEDEF] font-grotesk font-semibold text-xs uppercase mb-2">
              Smart Contracts
            </h4>
            <ul className="space-y-1">
              <li>
                <a
                  href={`${CONTRACT_ADDRESSES.explorer}/address/${CONTRACT_ADDRESSES.XMoodStreamCore}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#3ED6C4] flex items-center space-x-1"
                >
                  <span>Core Contract</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`${CONTRACT_ADDRESSES.explorer}/address/${CONTRACT_ADDRESSES.TipVault}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#3ED6C4] flex items-center space-x-1"
                >
                  <span>TipVault (95/5)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`${CONTRACT_ADDRESSES.explorer}/address/${CONTRACT_ADDRESSES.RewardDistributor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#3ED6C4] flex items-center space-x-1"
                >
                  <span>Reward Distributor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#ECEDEF] font-grotesk font-semibold text-xs uppercase mb-2">
              Security & Transparency
            </h4>
            <p className="text-xs text-[#8B92A3] font-sans">
              Non-custodial. Tips are routed direct-to-wallet with automated 5% treasury allocation.
            </p>
          </div>

        </div>

        <div className="pt-4 border-t border-[#282D3B] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#656C7D]">
          <div>© 2026 X-Mood Stream. EVM Compatible (BOT Chain & Base).</div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>Status: <strong className="text-[#3ED6C4]">Live on Testnet</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
