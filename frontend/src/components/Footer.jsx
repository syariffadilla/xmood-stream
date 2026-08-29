'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '../contracts/addresses';
import { ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  const { chain } = useAccount();
  const contracts = getContractAddresses(chain?.id);

  return (
    <footer className="w-full border-t border-line bg-base text-sub py-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-main font-display font-bold text-sm">
              <span className="w-2 h-2 rounded bg-gold"></span>
              <span>X-MOOD STREAM</span>
            </div>
            <p className="text-sub text-xs leading-relaxed max-w-xs">
              On-chain social micro-publishing protocol with non-custodial 95% creator tipping settlement and daily activity rewards.
            </p>
          </div>

          <div>
            <h4 className="text-main font-display font-semibold text-xs uppercase tracking-wider mb-3">
              Active Network
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>Chain: <span className="text-main">{contracts.chainName} ({contracts.chainId})</span></li>
              <li>Gas Asset: <span className="text-main">BOT</span></li>
              <li>Tip Unit: <span className="text-gold">mUSDT (6 decimals)</span></li>
              <li>Reward Token: <span className="text-glacier">$XMS (18 decimals)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-main font-display font-semibold text-xs uppercase tracking-wider mb-3">
              Contracts
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>
                <a
                  href={`${contracts.explorer}/address/${contracts.XMoodStreamCore}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-main flex items-center space-x-1 transition-colors"
                >
                  <span>XMoodStreamCore</span>
                  <ExternalLink className="w-3 h-3 text-sub" />
                </a>
              </li>
              <li>
                <a
                  href={`${contracts.explorer}/address/${contracts.TipVault}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-main flex items-center space-x-1 transition-colors"
                >
                  <span>TipVault (95/5 Split)</span>
                  <ExternalLink className="w-3 h-3 text-sub" />
                </a>
              </li>
              <li>
                <a
                  href={`${contracts.explorer}/address/${contracts.RewardDistributor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-main flex items-center space-x-1 transition-colors"
                >
                  <span>RewardDistributor</span>
                  <ExternalLink className="w-3 h-3 text-sub" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-main font-display font-semibold text-xs uppercase tracking-wider mb-3">
              Infrastructure
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-main flex items-center space-x-1 transition-colors"
                >
                  <span>Block Explorer</span>
                  <ExternalLink className="w-3 h-3 text-sub" />
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-main flex items-center space-x-1 transition-colors"
                >
                  <span>Network Faucet</span>
                  <ExternalLink className="w-3 h-3 text-sub" />
                </a>
              </li>
              <li>
                <a
                  href="https://dex.botchain.ai/#/swap"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-main flex items-center space-x-1 transition-colors"
                >
                  <span>BDEX Swap</span>
                  <ExternalLink className="w-3 h-3 text-sub" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-sub">
          <div>Verified On-Chain Architecture • Non-Custodial Protocol</div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-glacier"></span>
            <span>Connected: {contracts.chainName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
