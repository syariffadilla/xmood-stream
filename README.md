# 🚀 X-Mood Stream — SocialFi Tipping & Rewards Protocol

**X-Mood Stream** is a high-performance decentralized SocialFi micro-blogging and creator tipping DApp deployed on **Base Sepolia** (Chain ID `84532`).

Users broadcast thoughts and alpha on-chain, receive direct tips in **mUSDT** (95% creator split, 5% protocol treasury), and earn **$XMS Reward Tokens** with every post, tip earned, and daily check-in.

---

## 🌐 Live Base Sepolia Smart Contracts

* **Network**: Base Sepolia
* **Chain ID**: `84532`
* **RPC URL**: `https://sepolia.base.org`
* **Explorer**: [https://sepolia.basescan.org](https://sepolia.basescan.org)

| Contract Name | Address (Base Sepolia) | Basescan Link |
|---|---|---|
| **MockUSDT (`mUSDT`)** | `0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869` | [View on Basescan](https://sepolia.basescan.org/address/0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869) |
| **RewardToken (`$XMS`)** | `0xedE78e63e0d50FF92e936a6699E0303208a0892F` | [View on Basescan](https://sepolia.basescan.org/address/0xedE78e63e0d50FF92e936a6699E0303208a0892F) |
| **XMoodStreamCore** | `0xe417f89D94CE38364Da1757BE68910765AdEdEC2` | [View on Basescan](https://sepolia.basescan.org/address/0xe417f89D94CE38364Da1757BE68910765AdEdEC2) |
| **TipVault (95/5 Split)** | `0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E` | [View on Basescan](https://sepolia.basescan.org/address/0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E) |
| **RewardDistributor** | `0xd8b005D006994cDEDFABf0DF170D0d2C58F27335` | [View on Basescan](https://sepolia.basescan.org/address/0xd8b005D006994cDEDFABf0DF170D0d2C58F27335) |

---

## 📤 1. Panduan Push ke GitHub

Jalankan perintah berikut di terminal root folder project (`e:\xmood-stream`):

```bash
# 1. Inisialisasi Git (jika belum)
git init

# 2. Tambahkan semua file (file .env & seed-wallets.json otomatis terabaikan oleh .gitignore)
git add .

# 3. Buat commit pertama
git commit -m "feat: complete X-Mood Stream SocialFi DApp with Base Sepolia integration"

# 4. Ganti branch ke main
git branch -M main

# 5. Hubungkan ke repository GitHub Anda (ganti URL dengan repository milik Anda)
git remote add origin https://github.com/USERNAME_ANDA/xmood-stream.git

# 6. Push ke GitHub
git push -u origin main
```

---

## ⚡ 2. Panduan Deploy ke Vercel

Setelah kode ter-push ke GitHub, Anda bisa langsung mendeploy ke Vercel dalam 2 menit:

1. Buka dashboard **[vercel.com](https://vercel.com)** dan klik **Add New Project**.
2. Pilih repository GitHub **`xmood-stream`** yang baru saja Anda push.
3. Pada bagian **Root Directory**, klik **Edit** dan pilih folder:
   👉 **`frontend`**
4. Pada bagian **Environment Variables**, tambahkan:

| Key | Value | Keterangan |
|---|---|---|
| `PRIVATE_KEY` | `0x7ed60a3fb9416d20796b6234ac3c9af75771fd07a5fcd44bb9ba34f75028fbbf` | Untuk Gasless Faucet API |
| `BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` | RPC Base Sepolia |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` | Public Client RPC |

5. Klik tombol **Deploy**.
6. Selesai! Website DApp Anda langsung aktif dengan domain HTTPS gratis (contoh: `xmood-stream.vercel.app`).

---

## 💻 3. Menjalankan Secara Lokal (Local Development)

### Jalankan Frontend:
```bash
# Masuk ke folder frontend
cd frontend

# Install dependensi (jika belum)
npm install

# Jalankan server development
npm run dev

# Atau jalankan mode production yang super cepat:
npm run build
npm run start
```
Buka di browser: **[http://localhost:3000](http://localhost:3000)**

### Jalankan Test Smart Contract:
```bash
# Di root folder
npm run test
```

### Seeding On-Chain Data (Opsional):
Jika ingin menyiarkan 10 posting baru dan simulasi tip antar dummy wallet di Base Sepolia:
```bash
npm run seed:base-sepolia
```

---

## 🛠️ Fitur Utama Platform

1. **On-Chain Micro-Posting**: Publikasi post langsung ke smart contract `XMoodStreamCore`.
2. **Direct USDT Tipping (95/5 Split)**: Tipping non-custodial via `TipVault` (95% creator, 5% protocol treasury).
3. **$XMS Reward Engine**: Klaim reward loyalitas $XMS di `RewardDistributor` dengan siklus cooldown 24 jam.
4. **Live Leaderboard**: Peringkat on-chain Top Creators & Top Patrons dari event log.
5. **Gasless Testnet Faucet**: Faucet modal dengan proteksi IP rate-limiting 1x per 24 jam.
6. **Desain Stitch High-Fidelity**: Palet flat dark mode `#12151C`/`#1B1F29` dengan signature gradient `#3ED6C4` $\rightarrow$ `#1E56E0`.

---

## 🔒 Keamanan & Lisensi
- File `.env` dan `seed-wallets.json` telah dimasukkan ke `.gitignore` sehingga tidak akan terunggah ke repo publik.
- MIT License © 2026 X-Mood Stream.
