# X-Mood Stream — SocialFi Tipping & Rewards Protocol

**X-Mood Stream** is a decentralized Web3 SocialFi micro-blogging and creator tipping platform built on **Base Sepolia**. Users broadcast updates on-chain, receive direct tips in **mUSDT** (95% creator split, 5% protocol treasury), and earn **$XMS Reward Tokens** with every broadcast, tip earned, and daily check-in.

---

## 🌟 Key Features

1. **On-Chain Micro-Posting**: Content and mood hashes stored permanently on `XMoodStreamCore.sol`.
2. **Direct USDT Tipping**: Non-custodial 95% creator / 5% treasury split via `TipVault.sol` with automatic token allowance handling.
3. **$XMS Reward Engine**: Automated minting of utility and loyalty tokens via `RewardDistributor.sol` with an on-chain 24-hour cooldown mechanism.
4. **Live Leaderboard**: Real-time ranking of Top Creators and Top Patrons derived from event logs.
5. **Built-in Testnet Faucet**: 1-click testnet faucet modal in the frontend to claim 100 `mUSDT` for seamless testing.
6. **Pixel-Perfect Design System**: High-fidelity dark mode UI (`#12151C`/`#1B1F29`), signature gradient accents (`#3ED6C4` $\rightarrow$ `#1E56E0`), and monospace ledger typography.

---

## 🌐 Network & Smart Contracts (Base Sepolia)

* **Network**: Base Sepolia
* **Chain ID**: `84532`
* **RPC URL**: `https://sepolia.base.org`
* **Currency**: `ETH` (Testnet)
* **Block Explorer**: [https://sepolia.basescan.org](https://sepolia.basescan.org)

### Deployed Contract Addresses

| Contract Name | Address | Basescan Link |
|---|---|---|
| **MockUSDT (`mUSDT`)** | `0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869` | [View on Basescan](https://sepolia.basescan.org/address/0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869) |
| **RewardToken (`$XMS`)** | `0xedE78e63e0d50FF92e936a6699E0303208a0892F` | [View on Basescan](https://sepolia.basescan.org/address/0xedE78e63e0d50FF92e936a6699E0303208a0892F) |
| **XMoodStreamCore** | `0xe417f89D94CE38364Da1757BE68910765AdEdEC2` | [View on Basescan](https://sepolia.basescan.org/address/0xe417f89D94CE38364Da1757BE68910765AdEdEC2) |
| **TipVault** | `0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E` | [View on Basescan](https://sepolia.basescan.org/address/0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E) |
| **RewardDistributor** | `0xd8b005D006994cDEDFABf0DF170D0d2C58F27335` | [View on Basescan](https://sepolia.basescan.org/address/0xd8b005D006994cDEDFABf0DF170D0d2C58F27335) |

---

## 🏗️ Tech Stack

* **Smart Contracts**: Solidity `^0.8.24`, OpenZeppelin Contracts v5, Hardhat, Chai, Ethers.js
* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, RainbowKit, Wagmi v2, Viem, TanStack Query
* **Icons & Typography**: Lucide React, Google Fonts (`Space Grotesk`, `JetBrains Mono`, `Inter`)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd xmood-stream

# Install smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Smart Contract Testing & Local Deployment

```bash
# Run unit tests (11 passing tests)
npm run test

# Compile contracts
npm run compile

# Test deploy locally
npm run deploy:local
```

### 3. Run Frontend Locally

```bash
# Start Next.js development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 🧪 End-to-End User Flow (Testing Guide)

1. **Connect Wallet**: Click **Connect Wallet** on the top right and select MetaMask (connected to Base Sepolia).
2. **Claim Test Tokens**: Click the **+100 Faucet** button on the navbar to mint 100 `mUSDT`.
3. **Broadcast Post**: Click **Post / Broadcast**, enter a status update, and confirm the transaction.
4. **Send Tip**: Go to **Feed**, find a creator post, click **Tip USDT**, enter an amount (e.g. 5 USDT), and confirm the approval + tip transactions.
5. **Claim $XMS Rewards**: Go to **Rewards Hub**, check your available rewards (Base 5 $XMS + 10 $XMS per post + 0.1 $XMS per USDT tip), and click **Claim Now**.
6. **Check Leaderboard**: Go to **Leaderboard** to view real-time rankings for Top Creators & Top Tippers.

---

## 📦 Vercel Deployment

1. Push this repository to GitHub.
2. Import project on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Build command will default to `next build` and output directory to `.next`.
5. Deploy and start testing live!

---

## 📄 License
MIT License.
