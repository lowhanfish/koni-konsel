# Backend Handoff — KONI Konawe Selatan

Dokumen ini adalah titik awal untuk melanjutkan pengembangan backend pada sesi berikutnya. Kondisi terakhir yang didokumentasikan: 1 Oktober 2026, branch `main`.

## Ringkasan arsitektur

Backend berada di aplikasi Next.js yang sama, bukan service Express terpisah.

- Next.js Route Handlers menyediakan HTTP API.
- Prisma `6.19.0` mengakses MySQL/MariaDB.
- Zod memvalidasi query string dan request body.
- TanStack Query menangani fetch, cache, mutation, dan invalidasi cache di client.
- Zustand menyimpan state pencarian, status, dan halaman pada panel admin.
- Pencarian menggunakan debounce 350 ms sebelum request dikirim.
- Password admin di-hash dengan bcrypt (cost 12).
- Session acak disimpan dalam cookie HttpOnly, sedangkan hanya hash token yang disimpan di database.
- Otorisasi memakai role `SUPER_ADMIN`, `EDITOR`, dan `CONTRIBUTOR`.

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

Isi juga `ADMIN_EMAIL` dan `ADMIN_PASSWORD` sebelum menjalankan seed. Seeder membuat atau memperbarui akun super admin tanpa menyimpan password mentah di database.

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

Schema saat ini memiliki model `ContentItem`, `User`, `Session`, `ContactMessage`, dan `SiteSetting`. Model konten generik mendukung lima jenis konten:

- `NEWS`
- `PROGRAM`
- `SPORT_BRANCH`
- `GALLERY`
- `ACHIEVEMENT`

Status yang tersedia: `DRAFT`, `PUBLISHED`, `ACTIVE`, `SCHEDULED`, dan `ARCHIVED`.

Field penting mencakup `title`, `slug`, `category`, `summary`, `metadata` JSON, `publishedAt`, `viewCount`, serta timestamp. Kombinasi `kind + slug` unik. Migrasi pertama berada di `prisma/migrations/20260929145242_init_content`.

Seeder bersifat idempotent melalui `createMany({ skipDuplicates: true })` dan memasukkan tiga record untuk setiap jenis konten.

`User` menyimpan identitas, hash password, role, status aktif, dan waktu login terakhir. `Session` menyimpan hash token, expiry tujuh hari, serta relasi cascade ke user. Session kedaluwarsa dibersihkan ketika session baru dibuat atau ketika token lama diperiksa.

`ContactMessage` menyimpan formulir kontak publik dan status penanganannya. `SiteSetting` menyimpan satu konfigurasi identitas, alamat, kontak, serta kanal media sosial yang digunakan panel admin dan tampilan publik.

## HTTP API

### Autentikasi

- `POST /api/auth/login` menerima `email` dan `password`, lalu memasang cookie `koni_session`.
- `GET /api/auth/me` mengembalikan user aktif dari session.
- `POST /api/auth/logout` menghapus session database dan cookie.

Halaman `/admin/**` dilindungi oleh `app/admin/layout.tsx`. Pengunjung tanpa session diarahkan ke `/login?next=/admin`. Parameter `next` disanitasi untuk mencegah open redirect.

Aturan role pada Content API:

- Semua role aktif dapat membaca konten.
- Semua role dapat membuat konten; konten dari `CONTRIBUTOR` selalu dipaksa menjadi `DRAFT`.
- Hanya `EDITOR` dan `SUPER_ADMIN` dapat mengedit.
- Hanya `SUPER_ADMIN` dapat menghapus.

### Health check

`GET /api/health`

Respons sukses:

```json
{ "status": "ok", "database": "connected" }
```

### Konten publik

`GET /api/public/content` menerima `kind`, `q`, `page`, dan `pageSize`. Endpoint ini tidak memerlukan session dan hanya mengembalikan konten dengan status `PUBLISHED` atau `ACTIVE`. Halaman berita, program, cabang olahraga, galeri, prestasi, serta beranda menggunakan endpoint ini.

Detail berita publik tersedia di `/berita/:slug`; hanya konten terbit/aktif yang dapat dibuka dan setiap kunjungan menambah `viewCount`.

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

### Pesan, pengguna, dan pengaturan

- `POST /api/contact` menerima pesan dari formulir kontak publik.
- `/api/messages` menyediakan daftar pesan bagi admin; `/api/messages/:id` menangani perubahan status dan hapus.
- `/api/users` menyediakan manajemen akun bagi `SUPER_ADMIN`, termasuk perlindungan akun sendiri dan super admin terakhir.
- `GET /api/settings` membaca pengaturan website untuk tampilan publik, sedangkan `PATCH /api/settings` menyimpan perubahan khusus `SUPER_ADMIN`.

## Alur frontend

File utama:

- `app/providers.tsx`: satu `QueryClient` untuk aplikasi.
- `hooks/use-content.ts`: query list/detail serta mutation create/edit/delete.
- `hooks/use-public-content.ts`: query konten terbit untuk halaman publik.
- `hooks/use-current-user.ts`: data user aktif untuk menyesuaikan aksi berdasarkan role.
- `hooks/use-debounced-value.ts`: debounce generik 350 ms.
- `stores/admin-content-store.ts`: state query, status, dan pagination.
- `app/admin/admin-section.tsx`: panel yang memakai seluruh fondasi tersebut.
- `lib/content.ts`: type bersama, mapping section-to-kind, dan label status.

TanStack Query memakai key `['content', query]`. Mutation create/edit/delete meng-invalidasi prefix `['content']`, sehingga tabel aktif mengambil data baru tanpa manipulasi cache manual.

Panel konten sekarang menyediakan create, preview detail, edit, dan dialog konfirmasi delete. Form create/edit menggunakan `contentFormSchema` yang sama dengan validasi server dan menampilkan error di field terkait. Dashboard `/admin` mengambil berita terbaru langsung dari API; pembuatan konten diarahkan ke halaman manajemen berita agar tidak ada state mock kedua.

Panel pesan masuk, pengguna, dan pengaturan sudah memakai database. Seluruh tombol aksi yang tampil terhubung ke operasi nyata; pencarian hanya ditampilkan pada halaman yang mendukung pencarian.

## Yang sudah diuji

- Koneksi MySQL dan health check.
- Migrasi serta seed 15 record.
- List dengan pencarian server-side.
- Create, publish, tampil pada API/halaman publik, patch, dan delete end-to-end; record uji sudah dihapus.
- Redirect halaman admin tanpa session, login bcrypt, cookie/session, akses API terautentikasi, logout, dan invalidasi session.
- Validasi field invalid (HTTP 400), detail, update/publish, delete (HTTP 204), serta konfirmasi record terhapus (HTTP 404).
- `npm run lint` tanpa warning/error.
- Production build dengan `npx next build --webpack` berhasil.
- `npm run audit:links` memastikan tautan internal tidak mengarah ke route yang hilang.
- `npm run smoke:admin` memverifikasi autentikasi, CRUD/publikasi konten, pesan kontak, pengguna, pengaturan, logout, dan cleanup.

## Batasan dan pekerjaan berikutnya

Fondasi CRUD, inbox kontak, pengguna, pengaturan, serta publikasi konten sudah aktif. Pekerjaan lanjutan yang disarankan:

1. Implementasikan upload melalui object storage, bukan menyimpan file besar di database.
2. Tambahkan rate limiting login dan formulir kontak, rotasi session, audit log, dan proteksi CSRF eksplisit sebelum production.
3. Tambahkan integration test otomatis untuk Route Handlers dan komponen admin sebagai pelengkap smoke test.
4. Pertimbangkan model domain terpisah ketika field program, cabor, galeri, atau prestasi sudah final; `metadata` JSON hanya jembatan awal.

## Catatan dependency

`npm audit --omit=dev` saat handoff melaporkan empat advisory high pada toolchain Prisma CLI melalui `@prisma/config` (`deepmerge-ts` dan `effect`). Perintah audit menyarankan downgrade paksa Prisma ke 6.12.0. Downgrade otomatis tidak dilakukan karena berisiko mengubah toolchain tanpa kebutuhan runtime yang terbukti. Tinjau ulang setelah Node dinaikkan dan Prisma dapat dimigrasikan ke rilis stabil terbaru.

## Riwayat milestone

- `dd73041` — Prisma schema, migration, seed, API, provider, hooks, dan store.
- `f72b335` — Integrasi panel admin, TanStack Query, Zustand, dan debounce.
- `83df101` — Login/logout, session database, proteksi admin/API, dan role-based access.
- `d2663a5` — Audit dan perbaikan navigasi publik.
- `752d41a` — Penguatan alur konten admin dan smoke test.
- `b2c108e` — Formulir kontak publik dan kotak masuk admin.
- `c69b330` — Manajemen akun admin.
- `ea69d4c` — Pengaturan website persisten dan integrasi tampilan publik.

Setelah perubahan berikutnya selesai dan lolos verifikasi, commit kecil per milestone lalu push ke `origin/main`.
