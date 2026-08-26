# 🚀 X-Mood Stream — SocialFi Tipping & Rewards Protocol

<div align="center">

![Network: Base Sepolia](https://img.shields.io/badge/Network-Base_Sepolia-blue?style=for-the-badge&logo=ethereum)
![Chain ID](https://img.shields.io/badge/Chain_ID-84532-363636?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?style=for-the-badge&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Status](https://img.shields.io/badge/Status-Live_on_Testnet-success?style=for-the-badge)

**A high-performance decentralized SocialFi micro-blogging and creator tipping protocol on Base Sepolia.**  
*Broadcast verified alpha on-chain, tip creators in USDT with a 95% revenue split, and earn $XMS reward tokens.*

</div>

---

## 📖 1. Overview & Problem Solved

**X-Mood Stream** transforms social micro-blogging into a transparent financial interaction layer. In Web2 social platforms, creators generate attention while centralized platforms capture almost all platform fees and advertising revenues.

X-Mood Stream introduces a **non-custodial, dual-token SocialFi mechanism**:
- **Direct Value Transfer (mUSDT)**: When users tip a creator's post, **95% goes directly to the creator's wallet**, and only **5%** is allocated to the protocol treasury.
- **Platform Utility & Loyalty ($XMS)**: Every on-chain activity (publishing posts, receiving tips, and daily check-ins) rewards users with **$XMS tokens** governed by an on-chain 24-hour cooldown cycle.

---

## 🌟 2. Key Platform Features

* **⚡ On-Chain Micro-Posting**: Post hashes are stored permanently on `XMoodStreamCore.sol` with timestamp and author indexing.
* **💖 Direct USDT Tipping (95/5 Split)**: Immediate creator tipping via `TipVault.sol` with automatic token approval handling.
* **🎁 $XMS Reward Distributor**: Automated minting of utility reward tokens via `RewardDistributor.sol` based on creator activity with a strict 24-hour cooldown per wallet.
* **🏆 Live On-Chain Leaderboard**: Real-time ranking of *Top Creators* (by USDT received) and *Top Patrons* (by USDT tipped).
* **🚰 Gasless Testnet Faucet**: Built-in 1-click testnet faucet with IP rate-limiting (1 claim per 24 hours per IP).
* **🎨 Modern Dark Ledger UI**: High-fidelity dark mode palette (`#12151C`/`#1B1F29`), signature gradient accents (`#3ED6C4` $\rightarrow$ `#1E56E0`), and monospace ledger typography.

---

## 🌐 3. Live Smart Contracts (Multi-Chain Deployments)

### A. BOT Chain Testnet (Chain ID: 968)
* **Network**: BOT Chain Testnet
* **Chain ID**: `968`
* **RPC URL**: `https://rpc.bohr.life`
* **Block Explorer**: [https://scan.botchain.ai](https://scan.botchain.ai)

| Contract Name | Address (BOT Chain Testnet) | Explorer Link |
|---|---|---|
| **MockUSDT (`mUSDT`)** | `0xBe73e5e6dda3FcA356D2bB9228C33258c526147E` | [View on BotScan](https://scan.botchain.ai/address/0xBe73e5e6dda3FcA356D2bB9228C33258c526147E) |
| **RewardToken (`$XMS`)** | `0x6cCd0e61710044c3060Fd51F572bF2f677275a87` | [View on BotScan](https://scan.botchain.ai/address/0x6cCd0e61710044c3060Fd51F572bF2f677275a87) |
| **XMoodStreamCore** | `0x16C5cb15a0CeB9f5dc83b9FE58aa475B0363DdaC` | [View on BotScan](https://scan.botchain.ai/address/0x16C5cb15a0CeB9f5dc83b9FE58aa475B0363DdaC) |
| **TipVault (95/5 Split)** | `0x00299f76c116d2F03E342E6911e16a892b02C4E3` | [View on BotScan](https://scan.botchain.ai/address/0x00299f76c116d2F03E342E6911e16a892b02C4E3) |
| **RewardDistributor** | `0xF49ddF41b02a714c38347Cc724f094706fDBd86c` | [View on BotScan](https://scan.botchain.ai/address/0xF49ddF41b02a714c38347Cc724f094706fDBd86c) |

### B. Base Sepolia (Chain ID: 84532)
* **Network**: Base Sepolia
* **Chain ID**: `84532`
* **RPC URL**: `https://sepolia.base.org`
* **Block Explorer**: [https://sepolia.basescan.org](https://sepolia.basescan.org)

| Contract Name | Address (Base Sepolia) | Basescan Explorer |
|---|---|---|
| **MockUSDT (`mUSDT`)** | `0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869` | [View on Basescan](https://sepolia.basescan.org/address/0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869) |
| **RewardToken (`$XMS`)** | `0xedE78e63e0d50FF92e936a6699E0303208a0892F` | [View on Basescan](https://sepolia.basescan.org/address/0xedE78e63e0d50FF92e936a6699E0303208a0892F) |
| **XMoodStreamCore** | `0xe417f89D94CE38364Da1757BE68910765AdEdEC2` | [View on Basescan](https://sepolia.basescan.org/address/0xe417f89D94CE38364Da1757BE68910765AdEdEC2) |
| **TipVault (95/5 Split)** | `0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E` | [View on Basescan](https://sepolia.basescan.org/address/0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E) |
| **RewardDistributor** | `0xd8b005D006994cDEDFABf0DF170D0d2C58F27335` | [View on Basescan](https://sepolia.basescan.org/address/0xd8b005D006994cDEDFABf0DF170D0d2C58F27335) |

---

## 💎 4. Dual-Token Architecture

```
                       ┌─────────────────────────────────────┐
                       │           X-MOOD STREAM             │
                       └──────────────────┬──────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌─────────────────────────┐                     ┌─────────────────────────┐
     │    Mock USDT (mUSDT)    │                     │   Reward Token ($XMS)   │
     ├─────────────────────────┤                     ├─────────────────────────┤
     │ • 6 Decimals            │                     │ • 18 Decimals           │
     │ • Real Value Transfer   │                     │ • Platform Utility      │
     │ • 95% to Creator        │                     │ • Max Supply: 100M      │
     │ • 5% to Treasury        │                     │ • Minted via Activity   │
     └─────────────────────────┘                     └─────────────────────────┘
```

| Token | Utility | Distribution |
|---|---|---|
| **mUSDT** | Creator tipping & value exchange | Minted via Gasless Testnet Faucet / Sent by users |
| **$XMS** | Internal platform rewards & loyalty | Minted via `RewardDistributor` (5 XMS Base Daily + 10 XMS/Post + 0.1 XMS/USDT Tip) |

---

## 🧪 5. Reviewer & Live Testing Flow

1. **Connect Wallet**: Click **Connect** on the top right with MetaMask set to **Base Sepolia** (Chain ID: `84532`).
2. **Claim Free Testnet USDT**: Click **+100 Faucet** in the navbar to receive 100 `mUSDT` instantly.
3. **Broadcast Post**: Write an update in the stream box and confirm the transaction.
4. **Send Tip**: Navigate to **Feed**, click **Send Tip** on any creator post.
5. **Claim $XMS**: Visit **Rewards Hub** to claim earned $XMS reward tokens.
6. **Check Rankings**: Check **Leaderboard** to view live on-chain standings.

---

## 🏗️ 6. Tech Stack

- **Smart Contracts**: Solidity `^0.8.24`, OpenZeppelin Contracts v5, Hardhat, Chai
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, RainbowKit, Wagmi v2, Viem, TanStack Query
- **Design & Icons**: Lucide React, Space Grotesk, JetBrains Mono, Inter

---

## 📄 License
Released under the [MIT License](LICENSE).
