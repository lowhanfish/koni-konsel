# Panduan Lengkap Deployment Docker ke CentOS 7
## Website KONI Konawe Selatan

Dokumentasi ini merangkum seluruh tahapan, konsep, dan arsitektur yang digunakan untuk mendockerisasi dan mendeploy aplikasi web **KONI Konawe Selatan** (Next.js 16 + React 19 + Prisma ORM) ke server **CentOS 7**.

---

## 1. Arsitektur & Konsep Dasar

### 1.1 Komponen Sistem
- **Aplikasi Web**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **ORM & Database**: Prisma ORM terhubung ke MySQL.
- **Runtime Container**: Node.js 20 berjalan di atas container Debian Bookworm Slim.
- **Server Host**: CentOS 7 dengan Docker Engine & Docker Compose V2.
- **Web Server Host**: Nginx (sebagai Reverse Proxy pada port 80 / 443).

### 1.2 Mengapa `network_mode: "host"` di CentOS 7?
Di Linux (CentOS 7), mode host membuat container berbagi kartu jaringan secara langsung dengan server fisik:
1. Container dapat langsung mengakses MySQL lokal (`127.0.0.1:3306`) maupun remote hostname tanpa konfigurasi bridge/NAT tambahan.
2. Port 3000 otomatis terbuka di server lokal dan siap diteruskan oleh Nginx.
3. Performa jaringan maksimal tanpa overhead virtualisasi bridge Docker.

### 1.3 Penyimpanan Data (Stateless Container)
Upload file gambar dan lampiran pada aplikasi ini disimpan langsung ke dalam tabel database MySQL sebagai data biner (**BLOB**). Oleh karena itu:
- Container bersifat **stateless** (tidak memerlukan Docker persistent volume untuk file upload).
- Container aman untuk di-build ulang, dihapus, atau di-restart kapan saja tanpa risiko kehilangan data media.

---

## 2. Persiapan di Lingkungan Lokal (macOS)

### 2.1 Mengaktifkan Standalone Output di Next.js
File: `frontend/next.config.ts`

Fitur standalone memaketkan hanya modul yang benar-benar dibutuhkan untuk produksi ke dalam folder `.next/standalone`, merampingkan ukuran image dari ~1GB menjadi ~380MB.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
```

---

### 2.2 Membuat `.dockerignore`
File: `frontend/.dockerignore`

Mencegah pengiriman folder lokal Mac ke dalam build context Linux:
```text
node_modules
.next
.git
.vscode
.DS_Store
*.tsbuildinfo
```

---

### 2.3 Menulis Multi-Stage `Dockerfile`
File: `frontend/Dockerfile`

Menggunakan **Node.js 20 Bookworm Slim** (Debian) karena:
- Menggunakan `glibc` yang memiliki kompatibilitas 100% dengan query engine binary Prisma ORM (mencegah error dynamic linking yang kerap terjadi di Alpine/musl).
- Selisih ukuran dengan Alpine hanya ~60MB, namun jauh lebih stabil.

```dockerfile
# Tahap 1: Base image dengan runtime Node.js 20 (Debian Bookworm Slim)
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Tahap 2: Install dependencies (Memanfaatkan Docker Layer Caching)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Tahap 3: Build Next.js & Prisma
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy DATABASE_URL untuk validasi schema saat npx prisma generate
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npx prisma generate
RUN npm run build

# Tahap 4: Runner (Hasil Produksi Bersih)
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Salin hanya hasil kompilasi
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]
```

---

### 2.4 Membuat `docker-compose.yml` di Root Project
File: `docker-compose.yml`

```yaml
services:
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: koni_web
    restart: always
    env_file:
      - ./frontend/.env
    network_mode: "host"
```

- `restart: always`: Otomatis menyalakan container jika server reboot atau crash.
- `network_mode: "host"`: Menghubungkan langsung ke interface jaringan host CentOS 7.

---

## 3. Langkah Deployment di Server CentOS 7

### 3.1 Install Git (Jika Belum Terpasang)
```bash
sudo yum install -y git
```

### 3.2 Clone Repository
Gunakan Personal Access Token (PAT) GitHub untuk autentikasi saat clone:
```bash
git clone https://github.com/<username>/koni-konsel.git
cd koni-konsel
```

### 3.3 Konfigurasi Environment Variable di Server
Buat file `frontend/.env` di server:
```bash
nano frontend/.env
```
Isi dengan kredensial database MySQL Anda:
```env
DATABASE_URL="mysql://username_db:password_db@host_db:3306/nama_db"
ADMIN_EMAIL="admin@konikonsel.id"
ADMIN_PASSWORD="GantiPasswordAdminAman123!"
```

### 3.4 Build dan Nyalakan Container
```bash
docker compose up -d --build
```

### 3.5 Verifikasi Container
1. Cek status container:
   ```bash
   docker compose ps
   ```
   *(Harus berstatus `Up`)*.

2. Cek respon HTTP lokal dari server:
   ```bash
   curl -I http://127.0.0.1:3000
   ```
   *(Harus mengembalikan `HTTP/1.1 200 OK`)*.

3. Melihat log aplikasi:
   ```bash
   docker compose logs -f web
   ```

---

## 4. Konfigurasi Reverse Proxy Nginx (Host CentOS 7)

Arahkan domain website Anda ke container port 3000 melalui Nginx di CentOS 7.

Buat file konfigurasi, misalnya `/etc/nginx/conf.d/koni.conf`:

```nginx
server {
    listen 80;
    server_name portal.konikonsel.id; # Ganti dengan domain Anda

    # Batas upload file (wajib diperbesar untuk upload lampiran/foto di admin)
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Uji dan reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Lembar Panduan Operasional Harian (Cheat Sheet)

| Perintah | Deskripsi |
|---|---|
| `docker compose up -d` | Menyalakan container di latar belakang |
| `docker compose up -d --build` | Mem-build ulang kode terbaru dan me-restart container |
| `docker compose ps` | Memeriksa status hidup/matinya container |
| `docker compose logs -f web` | Memantau log aktivitas dan pesan error secara real-time |
| `docker compose down` | Menghentikan dan menghapus container secara bersih |
| `docker compose restart web` | Me-restart container web tanpa build ulang |
| `docker compose exec web npx prisma migrate deploy` | Menjalankan migrasi skema database terbaru |
| `docker compose exec web npm run db:seed` | Menjalankan seeding data awal ke database |

### Alur Update Kode (Deployment Rutin) di Server:
Jika terdapat pembaruan kode yang di-push ke Git:
```bash
cd /path/to/koni-konsel
git pull origin main
docker compose up -d --build
```
Proses ini akan mengompilasi kode baru dan langsung menerapkan perubahan dengan downtime minimal.
