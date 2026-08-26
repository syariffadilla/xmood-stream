# 🚀 Deployment Guide (GitHub & Vercel)

Dokumen ini berisi panduan teknis khusus untuk mendeploy project **X-Mood Stream** ke GitHub dan hosting Vercel.

---

## 📤 1. Push ke GitHub

Jalankan perintah ini di terminal root (`e:\xmood-stream`):

```bash
# Inisialisasi Git
git init

# Tambahkan seluruh file (file rahasia .env dan seed-wallets.json otomatis diabaikan)
git add .

# Commit
git commit -m "feat: complete X-Mood Stream SocialFi DApp"

# Ganti branch ke main
git branch -M main

# Hubungkan ke repo GitHub Anda
git remote add origin https://github.com/USERNAME_ANDA/xmood-stream.git

# Push ke GitHub
git push -u origin main
```

---

## ⚡ 2. Deploy ke Vercel

### Jika Membuat Project Baru (Import Repository):
1. Buka **[vercel.com](https://vercel.com)** $\rightarrow$ klik **Add New Project** $\rightarrow$ pilih repo **`xmood-stream`**.
2. Di bagian **Framework Preset**, pastikan terpilih:
   👉 **`Next.js`**
3. Di bagian **Root Directory**, klik **Edit** dan pilih folder:
   👉 **`frontend`**
4. Di bagian **Environment Variables**, tambahkan:

| Name | Value |
|---|---|
| `PRIVATE_KEY` | `0x7ed60a3fb9416d20796b6234ac3c9af75771fd07a5fcd44bb9ba34f75028fbbf` |
| `BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` |

5. Klik **Deploy**!

---

### Jika Project Vercel Sudah Terlanjur Dibuat (Mengatasi Error "No Output Directory named public"):
Jika project sudah dibuat dan mengalami error tersebut:
1. Buka project Anda di Vercel $\rightarrow$ masuk ke tab **Settings** $\rightarrow$ pilih **General**.
2. Pada bagian **Build & Development Settings**:
   - **Framework Preset**: Ubah / pastikan memilih **Next.js** (jangan *Other*).
3. Pada bagian **Root Directory**:
   - Klik **Edit** $\rightarrow$ isi/pilih: **`frontend`** $\rightarrow$ klik **Save**.
4. Kembali ke tab **Deployments** $\rightarrow$ klik icon titik tiga `...` pada deployment terakhir $\rightarrow$ klik **Redeploy**!
