# X-Mood Stream — Perencanaan DApp (SocialFi Tipping + Reward Token)

## 1. Konsep Singkat

**X-Mood Stream** adalah DApp SocialFi berbasis EVM di mana user posting update/konten singkat (seperti micro-blog on-chain), dan user lain bisa memberi **tip dalam USDT** ke pembuat konten. Setiap aksi on-chain (posting, tip, boost, klaim reward) menggunakan **native reward token** sebagai gas/fee internal platform, sehingga token utility-nya jelas: dipakai untuk bayar aksi, sementara USDT jadi alat tukar nilai riil antar user.

Kenapa ini dipilih:
- Cukup sederhana untuk dikerjakan solo dengan bantuan AI (Stitch + Antigravity), tapi tetap punya "wow factor" visual (feed, profil, leaderboard).
- Ada 2 token yang saling berinteraksi (reward token utility + USDT sebagai nilai) → cerita tokenomics jelas dan gampang dijelaskan ke reviewer/komunitas.
- Fitur bisa dipecah jadi MVP kecil dulu, lalu dikembangkan bertahap.

---

## 2. Fitur MVP (Scope Realistis untuk Fase 1)

1. **Connect Wallet** (Metamask/WalletConnect, chain EVM target).
2. **Buat Post** — teks singkat (+ opsional gambar via IPFS), disimpan hash-nya on-chain, bayar fee kecil pakai reward token.
3. **Feed Publik** — daftar post terbaru, urutkan by waktu / by total tip.
4. **Tip Post** — user kirim USDT langsung ke pembuat post via smart contract (contract pegang % kecil sbg treasury/fee, sisanya ke creator).
5. **Profil User** — total tip diterima, total post, saldo reward token, riwayat aktivitas.
6. **Klaim Reward Token** — reward token didapat dari: posting rutin, menerima tip, atau daily check-in (quest sederhana).
7. **Leaderboard** — top creator by tip diterima, top tipper by tip dikirim.

### Fitur Fase 2 (opsional, kalau ada waktu lebih)
- Boost post (bayar reward token supaya post naik ke atas feed).
- Staking reward token untuk multiplier reward.
- Badge/NFT achievement untuk creator top.
- Sistem komentar/reply on-chain.

---

## 3. Alur Pengguna (User Flow)

```
Landing Page → Connect Wallet
      ↓
   Feed Utama ──────────────┐
      ↓                     ↓
  Buat Post              Lihat Profil User Lain
      ↓                     ↓
 Bayar fee (reward token)  Kirim Tip (USDT)
      ↓                     ↓
  Post tampil di feed    Creator terima USDT - fee%
      ↓
  Dapat reward token (dari aktivitas)
      ↓
  Klaim reward token → Dashboard/Profil
      ↓
  Leaderboard update otomatis
```

Halaman yang perlu didesain di Stitch:
1. Landing / Connect Wallet
2. Feed (list post + tombol tip)
3. Detail Post (opsional, kalau ada komentar)
4. Buat Post (modal/form)
5. Profil User (saldo, riwayat, achievement)
6. Leaderboard
7. Dashboard Klaim Reward

---

## 4. Arsitektur Smart Contract (Gambaran)

- `X-Mood StreamCore.sol` — logika posting (simpan hash konten + metadata event), emit event `PostCreated`.
- `TipVault.sol` — menerima USDT, split ke creator (misal 95%) & treasury (5%), emit event `TipSent`.
- `RewardToken.sol` — ERC-20 sederhana, minting dikontrol oleh contract lain (mint saat posting/tip/checkin), ada cap supply.
- `RewardDistributor.sol` — logika hitung & klaim reward token berdasarkan aktivitas (bisa pakai mapping sederhana + cooldown untuk mencegah spam).

Prinsip desain: pisahkan logic "sosial" (posting) dari logic "uang" (tip & reward) supaya smart contract lebih aman dan gampang diaudit/diuji satu-satu.

---

## 5. Tokenomics Ringkas

| Token | Fungsi | Sumber |
|---|---|---|
| **Reward Token (mis. $XMS)** | Fee internal posting, boost, staking, reward loyalitas | Diklaim dari aktivitas (posting, terima tip, check-in harian) — supply terbatas |
| **USDT** | Nilai tip riil antar user | Dikirim langsung oleh user (bukan dicetak platform) |

Fee split saat tip (contoh): 95% ke creator, 5% ke treasury (bisa dipakai buat isi ulang reward pool / operasional).

---

## 6. Rekomendasi Tech Stack

- **Chain**: EVM testnet target kamu (sesuaikan RPC & chain ID dengan yang diminta programnya).
- **Smart contract**: Solidity + Hardhat atau Foundry.
- **Frontend**: Next.js + Wagmi/Viem + RainbowKit (atau ethers.js kalau mau lebih ringan).
- **Storage konten**: IPFS (via web3.storage/Pinata) untuk teks panjang/gambar, hash-nya saja yang on-chain.
- **Desain**: Stitch AI → export ke React component / Tailwind, tinggal diintegrasikan Antigravity.

---

## 7. Prompt untuk Stitch AI (Desain UI/UX)

Gunakan prompt ini satu per satu per halaman (biar hasil desainnya konsisten, kasih tahu Stitch untuk pakai design system yang sama tiap kali):

**Prompt Global (jalankan dulu di awal untuk set gaya):**
```
Buatkan design system untuk DApp Web3 SocialFi bernama "X-Mood Stream".

HINDARI SECARA TEGAS gaya berikut karena terlalu umum dipakai AI generator:
- Gradasi ungu ke biru elektrik
- Aksen neon hijau/vermillion di atas background hitam pekat
- Background krem hangat dipadu font serif tebal + aksen terracotta
- Border-radius nol dengan layout koran bergaris hairline

Gunakan palet warna FLAT (tanpa gradient) berikut, jangan diubah:
- Background utama: #12151C (charcoal navy gelap, bukan hitam pekat)
- Surface/card: #1B1F29
- Teks utama: #ECEDEF
- Teks sekunder: #8B92A3
- Aksen primer (untuk aksi tip/value/USDT): #E8A33D (amber emas, merepresentasikan nilai/transfer)
- Aksen sekunder (untuk reward token $XMS): #3FA796 (teal kalem, bukan hijau neon)

Tipografi: gunakan pasangan font yang tidak generik —
- Display/heading: grotesk modern dengan karakter tegas (contoh arah: Space Grotesk / General Sans)
- Body text: sans-serif netral yang nyaman dibaca (contoh arah: Inter / IBM Plex Sans)
- Data/angka/alamat wallet: gunakan font monospace (contoh arah: JetBrains Mono / IBM Plex Mono) — konten crypto (hash, alamat, jumlah token) terasa lebih otentik dalam monospace, bukan sans-serif biasa.

Layout: card-based dengan border-radius sedang (8-12px, bukan 0 dan bukan terlalu bulat/pill).
Elemen signature: setiap card post punya elemen kecil ala "ledger/receipt" — garis putus-putus tipis atau notasi angka transaksi kecil di pojok, untuk menegaskan nuansa "value transfer" tanpa mengandalkan gradient atau warna neon.

Komponen dasar yang perlu didefinisikan: button primer (pakai aksen amber #E8A33D) & sekunder (outline),
card post, badge token (bedakan visual USDT vs $XMS secara warna solid, bukan gradient),
avatar wallet, navbar dengan tombol connect wallet dan logo wordmark "X-Mood Stream".

Motion: minim dan halus (micro-interaction saat hover/klik saja), hindari animasi berlebihan yang terasa "dibuat AI".
```

**Catatan: tempelkan paragraf berikut di SETIAP prompt halaman di bawah ini (landing, feed, buat post, profil, leaderboard, dashboard), sebelum instruksi halamannya:**
```
Ikuti design system yang sudah ditetapkan sebelumnya secara ketat: warna flat #12151C/#1B1F29/#E8A33D/#3FA796,
tanpa gradient, tanpa neon, tipografi grotesk+mono. Jangan menambahkan warna baru di luar palet ini.
```

**Prompt Halaman Landing:**
```
Desain landing page untuk DApp X-Mood Stream: hero section dengan headline singkat tentang
"posting, dapat tip USDT, kumpulkan reward token", tombol Connect Wallet menonjol,
preview mini dari feed di bawah hero, section singkat cara kerja (3 langkah: Post - Tip - Earn).
```

**Prompt Halaman Feed:**
```
Desain halaman feed utama DApp X-Mood Stream: list card post vertikal, tiap card berisi avatar,
username/alamat wallet singkat, isi post, jumlah tip diterima, tombol "Kirim Tip" dan tombol reaksi.
Ada filter di atas: Terbaru / Trending (by tip). Sertakan tombol floating "Buat Post" di pojok kanan bawah.
```

**Prompt Halaman Buat Post:**
```
Desain modal/form "Buat Post" untuk X-Mood Stream: textarea untuk isi post, upload gambar opsional,
info kecil "biaya posting: X $XMS", tombol submit dengan status loading saat transaksi diproses,
tampilkan estimasi gas dan saldo reward token user.
```

**Prompt Halaman Profil:**
```
Desain halaman profil user X-Mood Stream: header dengan avatar besar, alamat wallet, total tip diterima (USDT),
saldo reward token, grafik kecil aktivitas mingguan, list riwayat post, badge achievement jika ada.
```

**Prompt Halaman Leaderboard:**
```
Desain halaman leaderboard X-Mood Stream dengan dua tab: "Top Creator" (by tip diterima)
dan "Top Tipper" (by tip dikirim). Gunakan ranking list dengan avatar, nama, jumlah,
highlight 3 besar dengan badge emas/perak/perunggu.
```

**Prompt Dashboard Klaim Reward:**
```
Desain dashboard klaim reward token X-Mood Stream: kartu besar menampilkan reward yang bisa diklaim,
tombol "Claim Now", riwayat klaim sebelumnya, progress bar quest harian (check-in, posting, dapat tip).
```

---

## 8. Prompt untuk Antigravity (Development)

Jalankan bertahap — jangan minta semua sekaligus, ikuti urutan supaya AI-nya tidak overload dan hasil lebih terarah.

**Tahap 1 — Setup Project & Smart Contract:**
```
Buatkan struktur project DApp bernama X-Mood Stream dengan Hardhat + Solidity.
Buat 4 smart contract:
1. RewardToken.sol — ERC-20 standar dengan fungsi mint yang hanya bisa dipanggil oleh address contract lain (onlyMinter), simpan max supply.
2. X-Mood StreamCore.sol — fungsi createPost(string contentHash) yang menyimpan post ke mapping dan emit event PostCreated(address author, uint256 postId, string contentHash, uint256 timestamp).
3. TipVault.sol — fungsi tipPost(uint256 postId, uint256 amount) menggunakan token USDT (alamat token USDT sebagai parameter constructor), split 95% ke creator dan 5% ke treasury address, emit event TipSent.
4. RewardDistributor.sol — fungsi claimReward() yang menghitung reward berdasarkan jumlah post dan tip yang diterima user, dengan cooldown 24 jam antar klaim.
Sertakan unit test dasar untuk tiap contract menggunakan Hardhat + Chai.
```

**Tahap 2 — Deploy Script:**
```
Buatkan deploy script Hardhat untuk deploy keempat contract di atas secara berurutan ke [nama testnet/chain kamu],
lalu otomatis set address X-Mood StreamCore dan TipVault sebagai minter yang diizinkan di RewardToken.
Tampilkan semua address hasil deploy di akhir proses dan simpan ke file deployed-addresses.json.
```

**Tahap 3 — Integrasi Frontend:**
```
Buatkan frontend Next.js untuk DApp X-Mood Stream menggunakan Wagmi + Viem untuk koneksi wallet ke chain [chain ID kamu].
Buat halaman: Landing, Feed, Buat Post, Profil, Leaderboard, Dashboard Klaim Reward
sesuai desain yang sudah dibuat di Stitch (saya akan lampirkan komponen/screenshot desainnya).
Integrasikan fungsi:
- createPost() ke X-Mood StreamCore
- tipPost() ke TipVault (approve USDT dulu sebelum kirim)
- claimReward() ke RewardDistributor
Gunakan react-query atau SWR untuk fetch data on-chain, tampilkan loading state & toast notifikasi transaksi.
```

**Tahap 4 — Polishing & Testing End-to-End:**
```
Bantu saya cek ulang alur end-to-end DApp X-Mood Stream: connect wallet → buat post → kirim tip →
klaim reward. Cari bug UI/UX yang terlihat kasar, pastikan semua transaksi punya loading state dan
error handling yang jelas (misal saldo USDT tidak cukup, gas reward token kurang, dsb).
```

---

## 9. Catatan Penting

- Sesuaikan nama chain, RPC, chain ID, dan alamat token USDT dengan yang ditentukan oleh program/DM yang kamu ikuti.
- Kalau ada requirement spesifik dari programnya (misal wajib pakai kontrak tertentu, wajib whitelist, dsb), tambahkan itu di prompt Tahap 1 sebelum mulai coding.
- Simpan private key & RPC di file `.env`, jangan pernah hardcode di smart contract atau commit ke repo publik.

---

## 10. Update: Target Testnet — Base Sepolia

| Info | Value |
|---|---|
| Network Name | Base Sepolia |
| Chain ID | 84532 |
| RPC URL | https://sepolia.base.org |
| Currency | ETH (testnet) |
| Block Explorer | https://sepolia.basescan.org |

Karena USDT resmi tidak tersedia di testnet, gunakan **Mock USDT** (ERC-20 buatan sendiri, 6 desimal seperti USDT asli) untuk keperluan development dan demo.

### Prompt Final Tahap 1 (Antigravity) — Setup + Smart Contract untuk Base Sepolia

```
Buatkan struktur project DApp bernama "X-Mood Stream" dengan Hardhat + Solidity, target deploy ke Base Sepolia (chain ID 84532, RPC https://sepolia.base.org).

Buat 5 smart contract:

1. MockUSDT.sol — ERC-20 sederhana dengan 6 desimal (meniru USDT asli), punya fungsi mint(address to, uint256 amount) yang bisa dipanggil siapa saja (khusus untuk testnet, supaya mudah testing), nama token "Mock USDT", simbol "mUSDT".

2. RewardToken.sol — ERC-20 standar untuk reward token $XMS, dengan fungsi mint yang hanya bisa dipanggil oleh address contract lain yang diberi izin (onlyMinter modifier), simpan max supply sebesar 100,000,000 $XMS.

3. XMoodStreamCore.sol — fungsi createPost(string contentHash) yang menyimpan post ke mapping (postId => Post struct: author, contentHash, timestamp), emit event PostCreated(address indexed author, uint256 indexed postId, string contentHash, uint256 timestamp). Sertakan fungsi getPost(uint256 postId) dan getTotalPosts().

4. TipVault.sol — fungsi tipPost(uint256 postId, address creator, uint256 amount) menggunakan token mUSDT (address MockUSDT sebagai parameter constructor), split 95% ke creator dan 5% ke treasury address (treasury address sebagai parameter constructor), emit event TipSent(address indexed from, address indexed to, uint256 postId, uint256 amount). User harus approve mUSDT dulu sebelum tip (gunakan transferFrom).

5. RewardDistributor.sol — fungsi claimReward() yang menghitung reward $XMS berdasarkan jumlah post yang dibuat dan tip yang diterima user (misal: 10 $XMS per post, 1 $XMS per 10 mUSDT tip diterima), dengan cooldown 24 jam antar klaim per address, emit event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp).

Sertakan unit test dasar untuk kelima contract menggunakan Hardhat + Chai + ethers.js, termasuk test untuk: 
- Deploy semua contract dengan benar
- createPost menyimpan data dengan benar
- tipPost mensplit dana dengan benar (95/5)
- claimReward menghormati cooldown 24 jam
- RewardToken mint hanya bisa dipanggil oleh minter yang diizinkan

Gunakan Solidity versi 0.8.24 ke atas, ikuti best practice OpenZeppelin (import ERC20, Ownable dari @openzeppelin/contracts) untuk keamanan dasar.
```

### Prompt Final Tahap 2 (Antigravity) — Deploy ke Base Sepolia

```
Buatkan deploy script Hardhat untuk deploy 5 contract (MockUSDT, RewardToken, XMoodStreamCore, TipVault, RewardDistributor) secara berurutan ke Base Sepolia (chain ID 84532, RPC https://sepolia.base.org).

Setelah semua ter-deploy, otomatis:
1. Set XMoodStreamCore dan RewardDistributor sebagai minter yang diizinkan di RewardToken.
2. Set treasury address di TipVault (gunakan deployer address sebagai treasury sementara untuk testing).

Tampilkan semua address hasil deploy di akhir proses dan simpan ke file deployed-addresses.json.
Buatkan juga file .env.example yang berisi PRIVATE_KEY dan BASE_SEPOLIA_RPC_URL sebagai template, jangan hardcode private key di script.
Tambahkan config network Base Sepolia di hardhat.config.js.
```

---

## 11. Update Design System — Selaraskan dengan Logo Resmi X-Mood

Logo resmi X-Mood: lingkaran gradasi teal → biru dengan bentuk "ekor" kecil (aksen speech-bubble), huruf "X" putih di dalam, wordmark "X-MOOD" hitam tebal di bawah logo.

**Perubahan dari palet sebelumnya:** base warna gelap (navy charcoal) tetap dipakai untuk keterbacaan, TAPI gradasi teal-biru dari logo sekarang jadi **signature element** — dipakai terbatas di titik-titik kunci saja (tombol utama, logo, badge aktif), bukan disebar ke semua komponen. Ini beda dari "gradasi generik AI" yang kita hindari sebelumnya, karena gradasi ini punya sumber yang jelas: identitas brand X-Mood sendiri.

Palet warna baru:
- Background utama: `#12151C`
- Surface/card: `#1B1F29`
- Teks utama: `#ECEDEF`
- Teks sekunder: `#8B92A3`
- **Signature gradient (logo, tombol utama, highlight):** linear-gradient dari `#3ED6C4` (teal) ke `#1E56E0` (biru), sudut 135deg
- Aksen reward token $XMS: `#3FA796` (teal solid, senada dengan logo tapi flat, dipakai khusus buat badge token)
- Aksen tip/USDT: `#E8A33D` (amber, tetap dipertahankan sebagai pembeda visual dari $XMS)

### Prompt Update untuk Stitch AI (Selaraskan Design System dengan Logo)

```
Update design system X-Mood Stream supaya selaras dengan logo resmi brand: lingkaran gradasi teal (#3ED6C4) ke biru (#1E56E0) sudut 135 derajat, dengan huruf X putih dan wordmark "X-MOOD" hitam tebal.

Aturan penerapan gradasi INI PENTING — signature gradient (#3ED6C4 → #1E56E0) HANYA boleh dipakai di:
1. Logo/wordmark di navbar
2. Tombol utama "Connect Wallet" dan tombol "Tip"
3. Border/glow tipis pada card yang sedang aktif/selected
4. Avatar ring untuk user yang online/live

JANGAN pakai gradient ini di background, di semua card, atau di teks — supaya tetap konsisten dengan gaya flat/solid yang sudah ditetapkan sebelumnya. Base warna tetap:
- Background: #12151C
- Surface/card: #1B1F29 (solid, tanpa gradient, tanpa blur/glassmorphism)
- Teks utama: #ECEDEF, teks sekunder: #8B92A3

Badge $XMS pakai warna teal solid #3FA796 (bukan gradient, bukan neon).
Badge USDT/tip pakai warna amber solid #E8A33D (bukan gradient).

Tampilkan logo X-Mood asli (lingkaran gradient dengan ekor kecil) di navbar kiri atas, didampingi wordmark teks "X-Mood Stream" dengan font grotesk (bukan wordmark hitam tebal seperti logo asli, sesuaikan supaya kontras di background gelap — gunakan putih/#ECEDEF untuk teks di navbar).

Terapkan ulang ke semua halaman yang sudah ada (Welcome/Landing, Global Feed, My Profile, Leaderboard, Rewards Hub) secara konsisten.
```

---

## 12. Koreksi Desain — Network Label

Di landing page, teks "NETWORK: ETHEREUM" sudah dikoreksi jadi **"NETWORK: BASE SEPOLIA"** di file `code.html` (halaman landing_page_x_mood_stream), sesuai chain target yang sudah kita tetapkan. Semua halaman lain dicek dan tidak ada referensi chain yang salah.

---

## 13. Tahapan Lengkap Develop di Antigravity (Base Sepolia)

Jalankan berurutan, satu tahap selesai dan berhasil dulu baru lanjut ke tahap berikutnya. Jangan gabungkan beberapa tahap dalam satu prompt — supaya AI agent-nya fokus dan hasilnya gampang dicek.

### Tahap 0 — Persiapan (dilakukan manual, sebelum buka Antigravity)
1. Buat wallet baru khusus development (jangan pakai wallet utama). Simpan private key-nya.
2. Tambahkan network Base Sepolia di Metamask:
   - Chain ID: `84532`
   - RPC: `https://sepolia.base.org`
   - Explorer: `https://sepolia.basescan.org`
3. Ambil ETH testnet dari faucet Base Sepolia (Coinbase Developer Platform faucet, atau bridge dari Sepolia ETH via `https://bridge.base.org`).
4. Siapkan folder project kosong, buka di Antigravity.

### Tahap 1 — Setup Project & Smart Contract
Gunakan **Prompt Final Tahap 1** (lihat bagian 10 di dokumen ini). Antigravity akan membuat struktur Hardhat + 5 smart contract (MockUSDT, RewardToken, XMoodStreamCore, TipVault, RewardDistributor) beserta unit test.

**Checklist sebelum lanjut:**
- [ ] Semua contract berhasil di-compile (`npx hardhat compile` tanpa error)
- [ ] Semua unit test lulus (`npx hardhat test` semua hijau)
- [ ] Review manual isi contract — pastikan tidak ada fungsi yang bisa disalahgunakan (misal mint tanpa batas)

### Tahap 2 — Deploy ke Base Sepolia
Gunakan **Prompt Final Tahap 2** (lihat bagian 10). Isi file `.env` dengan private key wallet dev dan RPC URL, lalu jalankan deploy script.

**Checklist sebelum lanjut:**
- [ ] File `deployed-addresses.json` berhasil dibuat, berisi 5 address contract
- [ ] Cek tiap address di `https://sepolia.basescan.org` — pastikan contract benar-benar ter-deploy (ada bytecode)
- [ ] Test manual: mint beberapa MockUSDT ke wallet dev, pastikan saldo muncul di Metamask

### Tahap 3 — Integrasi Frontend dengan Desain Stitch
Upload semua file `code.html` dan `screen.png` dari hasil Stitch (6 halaman) ke Antigravity, lalu jalankan prompt berikut:

```
Saya sudah punya desain UI lengkap dari Stitch (terlampir: landing page, main feed, create post, user profile, leaderboard, rewards dashboard) dalam bentuk file HTML statis, dan 5 smart contract yang sudah di-deploy ke Base Sepolia dengan address berikut (ambil dari deployed-addresses.json):
- MockUSDT: [isi address]
- RewardToken ($XMS): [isi address]
- XMoodStreamCore: [isi address]
- TipVault: [isi address]
- RewardDistributor: [isi address]

Tolong buatkan project Next.js yang mengonversi keenam halaman HTML statis tersebut menjadi komponen React yang fungsional, dengan detail:

1. Gunakan Wagmi + Viem + RainbowKit (atau ConnectKit) untuk koneksi wallet, konfigurasi khusus untuk Base Sepolia (chain ID 84532).
2. Pertahankan struktur visual, warna, dan layout PERSIS seperti di file HTML yang saya lampirkan — jangan mendesain ulang, cukup konversi ke komponen React + hubungkan ke data on-chain.
3. Hubungkan fungsi-fungsi berikut ke tombol yang sesuai:
   - Tombol "Connect Wallet" → trigger wallet connection
   - Tombol "Broadcast" di Create Post → panggil createPost() di XMoodStreamCore, sebelumnya cek approve $XMS ke contract jika diperlukan untuk fee
   - Tombol "Send Tip" di Feed → panggil approve() di MockUSDT lalu tipPost() di TipVault
   - Tombol "Claim Now" di Rewards → panggil claimReward() di RewardDistributor
   - Data saldo USDT/XMS di Profile & Create Post → ambil real-time dari contract via useReadContract
   - Leaderboard → untuk versi awal, ambil data dari event log (getLogs) PostCreated dan TipSent, urutkan di frontend (belum perlu indexer/subgraph dulu)
4. Tambahkan loading state dan toast notification untuk setiap transaksi (pending, success, error/reverted).
5. Tampilkan pesan error yang jelas kalau saldo USDT/XMS tidak cukup atau user reject transaksi di wallet.
```

**Checklist sebelum lanjut:**
- [ ] Wallet berhasil connect dan menampilkan alamat + saldo ETH testnet
- [ ] Bisa bikin post baru dan muncul di feed (setelah refresh/re-fetch)
- [ ] Bisa kirim tip USDT dan saldo creator bertambah (cek di explorer)
- [ ] Bisa klaim reward $XMS dan saldo bertambah di wallet

### Tahap 4 — Testing End-to-End & Perbaikan
Jalankan **Prompt Final Tahap 4**:

```
Bantu saya audit alur end-to-end DApp X-Mood Stream di Base Sepolia:
1. Connect wallet → tampilkan saldo ETH, USDT, XMS dengan benar
2. Buat post baru → transaksi masuk, muncul di feed setelah konfirmasi
3. Kirim tip ke post orang lain → saldo USDT terpotong, creator menerima 95%, treasury menerima 5%
4. Klaim reward $XMS → saldo XMS bertambah, cooldown 24 jam ter-enforce dengan benar (tombol claim disabled kalau masih cooldown)

Untuk masing-masing alur, pastikan:
- Ada loading indicator yang jelas selama transaksi pending
- Ada pesan sukses yang jelas setelah transaksi confirmed
- Ada pesan error yang informatif kalau gagal (saldo kurang, user reject, gas kurang, network salah)
- Tombol tidak bisa diklik dobel saat transaksi masih diproses (mencegah double submit)

Perbaiki bug atau UX kasar yang kamu temukan.
```

### Tahap 5 — Deploy Frontend (Hosting)
```
Bantu saya deploy frontend Next.js X-Mood Stream ini ke Vercel. Pastikan environment variable
untuk RPC URL dan contract address sudah dikonfigurasi dengan benar di sana, dan buatkan
file .env.example untuk referensi.
```

**Checklist final sebelum share ke orang lain / submit ke program:**
- [ ] Link Vercel bisa diakses publik dan wallet bisa connect dari device lain
- [ ] Semua 5 contract address benar dan sudah diverifikasi di Basescan (opsional tapi bagus untuk kredibilitas — pakai `npx hardhat verify`)
- [ ] README singkat berisi: link demo, chain yang dipakai, cara dapat testnet USDT (mint dari MockUSDT), dan ringkasan fitur
