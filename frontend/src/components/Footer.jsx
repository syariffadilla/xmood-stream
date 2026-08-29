'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, getContractAddresses } from '../contracts/addresses';
import { ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  const { chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);

  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#070910] text-[#94A3B8] py-8 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#F3F4F6] font-grotesk font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5]"></span>
              <span>X-MOOD STREAM</span>
            </div>
            <p className="text-[#94A3B8] text-xs font-sans leading-relaxed">
              SocialFi Tipping & Rewards protocol on BOT Chain. Verifiable ledger of micro-posts and 95% creator tips.
            </p>
          </div>

          <div>
            <h4 className="text-[#F3F4F6] font-grotesk font-semibold text-xs uppercase mb-2 text-[#00F5A0]">
              Network Specs
            </h4>
            <ul className="space-y-1">
              <li>Chain: <span className="text-[#F3F4F6] font-semibold">{contracts.chainName} ({contracts.chainId})</span></li>
              <li>Currency: <span className="text-[#F3F4F6]">BOT</span></li>
              <li>Tip Token: <span className="text-[#F59E0B]">mUSDT (6 Decimals)</span></li>
              <li>Reward: <span className="text-[#00F5A0]">$XMS (18 Decimals)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#F3F4F6] font-grotesk font-semibold text-xs uppercase mb-2 text-[#00F5A0]">
              Smart Contracts
            </h4>
            <ul className="space-y-1">
              <li>
                <a
                  href={`${contracts.explorer}/address/${contracts.XMoodStreamCore}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>Core Contract</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`${contracts.explorer}/address/${contracts.TipVault}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>TipVault (95/5)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`${contracts.explorer}/address/${contracts.RewardDistributor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>Reward Distributor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#F3F4F6] font-grotesk font-semibold text-xs uppercase mb-2 text-[#00F5A0]">
              BOT Chain Hub
            </h4>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>BOT Faucet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://dex.botchain.ai/#/swap"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>BDEX Swap</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://bridge.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>Cross-Chain Bridge</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://dev-docs.botchain.ai/docs/Developers/quick-guide/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>Developer Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/BOTChain-bot"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00F5A0] flex items-center space-x-1"
                >
                  <span>Official GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B]">
          <div>© 2026 X-Mood Stream. Built for BOT Chain & EVM Ecosystems.</div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>Status: <strong className="text-[#00F5A0]">Live on {contracts.chainName}</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
