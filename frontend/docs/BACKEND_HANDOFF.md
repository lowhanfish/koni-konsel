# Backend Handoff — KONI Konawe Selatan

Dokumen ini adalah titik awal untuk melanjutkan pengembangan backend pada sesi berikutnya. Kondisi terakhir yang didokumentasikan: 29 September 2026, branch `main`.

## Ringkasan arsitektur

Backend berada di aplikasi Next.js yang sama, bukan service Express terpisah.

- Next.js Route Handlers menyediakan HTTP API.
- Prisma `6.19.0` mengakses MySQL/MariaDB.
- Zod memvalidasi query string dan request body.
- TanStack Query menangani fetch, cache, mutation, dan invalidasi cache di client.
- Zustand menyimpan state pencarian, status, dan halaman pada panel admin.
- Pencarian menggunakan debounce 350 ms sebelum request dikirim.

Prisma dipin ke versi 6 karena mesin lokal menggunakan Node.js `20.10.0`; Prisma 7+ membutuhkan Node yang lebih baru.

## Menjalankan proyek

Prasyarat:

- Node.js 20
- MySQL atau MariaDB aktif pada `127.0.0.1:3306`
- Database bernama `koni`

```bash
cd frontend
npm install
cp .env.example .env
```

Isi `DATABASE_URL` di `.env`. Konfigurasi lokal saat implementasi memakai user `root`, password `root`, dan database `koni`. File `.env` diabaikan Git dan tidak boleh di-commit.

```bash
npm run db:generate
npm run db:migrate -- --name nama_migrasi
npm run db:seed
npm run dev
```

Verifikasi:

```bash
curl http://localhost:3000/api/health
npm run lint
npx next build --webpack
```

Builder Webpack dipakai untuk verifikasi pada sesi implementasi karena Turbopack tidak diizinkan melakukan bind port internal oleh sandbox. Ini bukan kegagalan kode aplikasi.

## Model database

Model awal adalah `ContentItem` di `prisma/schema.prisma`. Model generik ini mendukung lima jenis konten:

- `NEWS`
- `PROGRAM`
- `SPORT_BRANCH`
- `GALLERY`
- `ACHIEVEMENT`

Status yang tersedia: `DRAFT`, `PUBLISHED`, `ACTIVE`, `SCHEDULED`, dan `ARCHIVED`.

Field penting mencakup `title`, `slug`, `category`, `summary`, `metadata` JSON, `publishedAt`, `viewCount`, serta timestamp. Kombinasi `kind + slug` unik. Migrasi pertama berada di `prisma/migrations/20260929145242_init_content`.

Seeder bersifat idempotent melalui `createMany({ skipDuplicates: true })` dan memasukkan tiga record untuk setiap jenis konten.

## HTTP API

### Health check

`GET /api/health`

Respons sukses:

```json
{ "status": "ok", "database": "connected" }
```

### Daftar dan pencarian konten

`GET /api/content`

Query string:

- `kind`: salah satu jenis konten
- `status`: salah satu status konten
- `q`: pencarian judul, kategori, dan ringkasan
- `page`: mulai dari 1
- `pageSize`: 1–100

Contoh:

```text
/api/content?kind=NEWS&q=renang&status=PUBLISHED&page=1&pageSize=10
```

Respons berisi `data` dan `meta` (`page`, `pageSize`, `total`, `pageCount`).

### Membuat konten

`POST /api/content`

```json
{
  "kind": "NEWS",
  "title": "Judul berita",
  "category": "Kegiatan",
  "summary": "Ringkasan",
  "status": "DRAFT"
}
```

Slug dibuat otomatis dan diberi suffix jika terjadi duplikasi.

### Detail, update, dan hapus

- `GET /api/content/:id`
- `PATCH /api/content/:id`
- `DELETE /api/content/:id`

`PATCH` menerima subset field create kecuali `kind`. Delete mengembalikan HTTP `204`.

## Alur frontend

File utama:

- `app/providers.tsx`: satu `QueryClient` untuk aplikasi.
- `hooks/use-content.ts`: query list serta mutation create/delete.
- `hooks/use-debounced-value.ts`: debounce generik 350 ms.
- `stores/admin-content-store.ts`: state query, status, dan pagination.
- `app/admin/admin-section.tsx`: panel yang memakai seluruh fondasi tersebut.
- `lib/content.ts`: type bersama, mapping section-to-kind, dan label status.

TanStack Query memakai key `['content', query]`. Mutation create/delete meng-invalidasi prefix `['content']`, sehingga tabel aktif mengambil data baru tanpa manipulasi cache manual.

## Yang sudah diuji

- Koneksi MySQL dan health check.
- Migrasi serta seed 15 record.
- List dengan pencarian server-side.
- Create, patch, dan delete end-to-end; record uji sudah dihapus.
- `npm run lint` tanpa warning/error.
- Production build dengan `npx next build --webpack` berhasil.

## Batasan dan pekerjaan berikutnya

Fondasi CRUD aktif untuk lima tipe konten. Bagian berikut masih placeholder dan sebaiknya dikerjakan berurutan:

1. Tambahkan autentikasi dan otorisasi sebelum panel admin dipublikasikan.
2. Buat model khusus `User`, `ContactMessage`, `SiteSetting`, serta media/file.
3. Tambahkan UI edit yang memakai endpoint `PATCH`; saat ini panel memiliki create dan delete.
4. Hubungkan dashboard `/admin` dan halaman publik ke data API/Prisma. Dashboard utama masih memakai mock data lokal.
5. Implementasikan upload melalui object storage, bukan menyimpan file besar di database.
6. Tambahkan integration test otomatis untuk Route Handlers dan komponen admin.
7. Pertimbangkan model domain terpisah ketika field program, cabor, galeri, atau prestasi sudah final; `metadata` JSON hanya jembatan awal.

## Catatan dependency

`npm audit --omit=dev` saat handoff melaporkan empat advisory high pada toolchain Prisma CLI melalui `@prisma/config` (`deepmerge-ts` dan `effect`). Perintah audit menyarankan downgrade paksa Prisma ke 6.12.0. Downgrade otomatis tidak dilakukan karena berisiko mengubah toolchain tanpa kebutuhan runtime yang terbukti. Tinjau ulang setelah Node dinaikkan dan Prisma dapat dimigrasikan ke rilis stabil terbaru.

## Riwayat milestone

- `dd73041` — Prisma schema, migration, seed, API, provider, hooks, dan store.
- `f72b335` — Integrasi panel admin, TanStack Query, Zustand, dan debounce.

Setelah perubahan berikutnya selesai dan lolos verifikasi, commit kecil per milestone lalu push ke `origin/main`.
