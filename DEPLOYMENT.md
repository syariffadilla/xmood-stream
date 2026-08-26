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

1. Buka **[vercel.com](https://vercel.com)** $\rightarrow$ klik **Add New Project** $\rightarrow$ pilih repo **`xmood-stream`**.
2. Di bagian **Root Directory**, pilih folder:
   👉 **`frontend`**
3. Di bagian **Environment Variables**, tambahkan:

| Name | Value |
|---|---|
| `PRIVATE_KEY` | `0x7ed60a3fb9416d20796b6234ac3c9af75771fd07a5fcd44bb9ba34f75028fbbf` |
| `BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` |

4. Klik **Deploy**!
