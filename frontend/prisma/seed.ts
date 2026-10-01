import { ContentKind, ContentStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

type SeedItem = {
  kind: ContentKind;
  slug: string;
  title: string;
  category: string;
  status: ContentStatus;
  summary: string;
  publishedAt: string;
  sourceTitle: string;
  sourceUrl: string;
  viewCount?: number;
};

const KONI_SOURCE = "https://koni.or.id/";
const KEMENPORA_SOURCE = "https://sispom.kemenpora.go.id/spobnas";

const items: SeedItem[] = [
  {
    kind: ContentKind.NEWS,
    slug: "wahyu-imran-pimpin-koni-konsel-2026-2031",
    title: "Wahyu Ade Pratama Imran Pimpin KONI Konawe Selatan Periode 2026–2031",
    category: "Organisasi",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2026-06-20T08:00:00+08:00",
    sourceTitle: "Oyisultra — Wakil Bupati Wahyu Imran Resmi Pimpin KONI Konawe Selatan",
    sourceUrl: "https://www.oyisultra.com/2026/06/20/wakil-bupati-wahyu-imran-resmi-pimpin-koni-konawe-selatan/",
    viewCount: 428,
    summary: "<p>Musyawarah Daerah KONI Kabupaten Konawe Selatan di Wonua Monapa, Ranomeeto, menetapkan Wahyu Ade Pratama Imran sebagai Ketua KONI Konawe Selatan periode 2026–2031.</p><p>Kepengurusan baru menempatkan pembinaan atlet lokal sebagai prioritas. Potensi putra-putri daerah akan dipetakan bersama pengurus cabang olahraga untuk membangun kontingen yang kompetitif.</p><h2>Fokus awal kepengurusan</h2><ul><li>Memperkuat koordinasi dengan seluruh cabang olahraga.</li><li>Menjaring dan memberdayakan atlet asli Konawe Selatan.</li><li>Menyiapkan pembinaan berkelanjutan menuju Porprov Sulawesi Tenggara.</li></ul>",
  },
  {
    kind: ContentKind.NEWS,
    slug: "seleksi-futsal-konsel-menuju-porprov-2026",
    title: "Seleksi Futsal Konawe Selatan Menjaring Talenta Menuju Porprov 2026",
    category: "Seleksi Atlet",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2026-06-14T08:00:00+08:00",
    sourceTitle: "Bikasmedia — AFK Konsel Sukses Gelar Seleksi Futsal Menuju Porprov 2026",
    sourceUrl: "https://bikasmedia.com/afk-konsel-sukses-gelar-seleksi-futsal-menuju-porprov-2026-ameeraa-fc-keluar-sebagai-juara/",
    viewCount: 356,
    summary: "<p>Asosiasi Futsal Kabupaten Konawe Selatan menggelar turnamen sekaligus seleksi atlet pada 12–13 Juni 2026. Kegiatan ini menjadi bagian dari penjaringan pemain untuk persiapan Porprov 2026.</p><p>Ameeraa FC asal Punggaluku menjadi juara, disusul Cikidit FC dari Ranomeeto dan Bouraq FC dari Lalonggombu. Pemain potensial dari peserta masuk dalam pemantauan tim pemandu bakat untuk tahapan seleksi berikutnya.</p>",
  },
  {
    kind: ContentKind.NEWS,
    slug: "sman-1-konsel-juara-umum-o2sn-2026",
    title: "SMAN 1 Konawe Selatan Raih Juara Umum O2SN Kabupaten 2026",
    category: "Olahraga Pelajar",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2026-06-16T08:00:00+08:00",
    sourceTitle: "SMAN 1 Konawe Selatan — Juara 1 Umum O2SN Tingkat Kabupaten 2026",
    sourceUrl: "https://sman1konaweselatan.sch.id/read/136/sman-1-konawe-selatan-raih-juara-1-umum-o2sn-tingkat-kabupaten-tahun-2026",
    viewCount: 392,
    summary: "<p>SMAN 1 Konawe Selatan meraih juara umum O2SN tingkat kabupaten yang diselenggarakan di SMAN 8 Konawe Selatan. Kontingen sekolah mengumpulkan lima medali emas dan dua medali perak.</p><p>Medali datang dari pencak silat, bulu tangkis, renang, panjat tebing, dan atletik. Hasil tersebut memperlihatkan kuatnya potensi atlet pelajar sebagai bagian penting dari jalur pembinaan olahraga daerah.</p>",
  },
  {
    kind: ContentKind.NEWS,
    slug: "vincent-kenpadidi-juara-bulu-tangkis-o2sn-2026",
    title: "Vincent Kenpadidi Juara Bulu Tangkis O2SN Konawe Selatan 2026",
    category: "Bulu Tangkis",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2026-06-16T10:00:00+08:00",
    sourceTitle: "LinkSultra — Vincent Kenpadidi Juara O2SN Bulu Tangkis Tunggal Putra",
    sourceUrl: "https://linksultra.com/vincent-kenpadidi-juara-o2sn-bulu-tangkis-tunggal-putra-harumkan-nama-sman-8-konawe-selatan/",
    viewCount: 244,
    summary: "<p>Vincent Kenpadidi dari SMAN 8 Konawe Selatan menjuarai nomor tunggal putra O2SN 2026 tingkat kabupaten. Pada pertandingan final di Aula Kantor Kecamatan Konda, ia menang melalui rubber game dengan skor 2–1.</p><p>Prestasi ini menegaskan pentingnya kompetisi pelajar dan latihan yang konsisten sebagai jalur awal menuju pembinaan atlet berprestasi.</p>",
  },
  {
    kind: ContentKind.NEWS,
    slug: "sepak-bola-konsel-juara-popda-sultra-2025",
    title: "Tim Sepak Bola Konawe Selatan Juara Popda Sulawesi Tenggara 2025",
    category: "Sepak Bola",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2025-10-26T08:00:00+08:00",
    sourceTitle: "Sultrack — Tim Sepak Bola Konsel Jawara Popda se-Sultra",
    sourceUrl: "https://sultrack.com/2025/10/26/tim-sepak-bola-konsel-jawara-dalam-ajang-popda-se-sultra/",
    viewCount: 517,
    summary: "<p>Tim sepak bola pelajar Kabupaten Konawe Selatan meraih medali emas pada Popda Sulawesi Tenggara 2025. Pada partai final, Konawe Selatan mengatasi Kolaka Timur melalui adu penalti dengan skor 4–3.</p><p>Capaian ini menjadi modal penting bagi pembinaan sepak bola usia muda dan memperlihatkan daya saing atlet pelajar Konawe Selatan di tingkat provinsi.</p>",
  },
  {
    kind: ContentKind.NEWS,
    slug: "konsel-peringkat-empat-porprov-xiv-sultra",
    title: "Konawe Selatan Raih 159 Medali dan Peringkat Empat Porprov XIV Sultra",
    category: "Porprov",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2022-12-04T08:00:00+08:00",
    sourceTitle: "ANTARA — Kendari Juara Umum Porprov XIV Sultra 2022",
    sourceUrl: "https://sultra.antaranews.com/berita/435383/kendari-juara-umum-porprov-xiv-sultra-2022",
    viewCount: 864,
    summary: "<p>Kontingen Konawe Selatan menutup Porprov XIV Sulawesi Tenggara 2022 di peringkat keempat klasemen akhir.</p><h2>Perolehan medali</h2><ul><li>45 medali emas</li><li>52 medali perak</li><li>62 medali perunggu</li></ul><p>Total 159 medali tersebut menjadi salah satu tonggak penting untuk evaluasi dan penguatan pembinaan menuju kompetisi berikutnya.</p>",
  },
  {
    kind: ContentKind.NEWS,
    slug: "taekwondo-konsel-juara-umum-porprov-2018",
    title: "Taekwondo Konawe Selatan Juara Umum Porprov XIII Sultra",
    category: "Taekwondo",
    status: ContentStatus.PUBLISHED,
    publishedAt: "2018-12-13T08:00:00+08:00",
    sourceTitle: "ANTARA — Porprov Sultra, Konsel Juara Cabang Taekwondo",
    sourceUrl: "https://sultra.antaranews.com/berita/297817/porprov-sultra-konsel-juara-cabang-taekwondo",
    viewCount: 731,
    summary: "<p>Tim taekwondo Konawe Selatan menjadi juara umum cabang taekwondo pada Porprov XIII Sulawesi Tenggara di Kabupaten Kolaka.</p><p>Kontingen mengumpulkan empat medali emas, satu perak, dan tiga perunggu dari nomor kyorugi serta poomsae. Hasil tersebut lahir dari kerja bersama atlet, pelatih, pengurus cabang, pemerintah daerah, dan masyarakat.</p>",
  },
  {
    kind: ContentKind.PROGRAM,
    slug: "pembinaan-atlet-muda",
    title: "Pembinaan Atlet Muda Berjenjang",
    category: "Pembibitan",
    status: ContentStatus.ACTIVE,
    publishedAt: "2026-07-01T08:00:00+08:00",
    sourceTitle: "Kemenpora — Sentra Pembinaan Olahragawan Berbakat Nasional",
    sourceUrl: KEMENPORA_SOURCE,
    summary: "<p>Program pembinaan atlet muda diarahkan untuk menemukan potensi sejak sekolah, klub, dan komunitas, kemudian menghubungkannya dengan cabang olahraga yang sesuai.</p><h2>Ruang lingkup</h2><ul><li>Pemetaan bakat dan rekam hasil kompetisi pelajar.</li><li>Latihan teknik dasar, kondisi fisik, karakter, dan sportivitas.</li><li>Evaluasi berkala bersama pelatih dan pengurus cabang olahraga.</li><li>Jalur pembinaan dari tingkat kabupaten menuju provinsi dan nasional.</li></ul>",
  },
  {
    kind: ContentKind.PROGRAM,
    slug: "pemusatan-latihan-daerah",
    title: "Pemusatan Latihan Daerah",
    category: "Prestasi",
    status: ContentStatus.ACTIVE,
    publishedAt: "2026-07-02T08:00:00+08:00",
    sourceTitle: "Kemenpora — Profil Pembinaan Olahragawan Elit",
    sourceUrl: "https://smepbdsi.kemenpora.go.id/profile",
    summary: "<p>Pemusatan latihan disiapkan bagi atlet yang telah melewati seleksi cabang olahraga dan masuk proyeksi kompetisi. Latihan harus terstruktur, terukur, dan berkelanjutan.</p><h2>Komponen latihan</h2><ul><li>Program fisik, teknik, taktik, dan mental.</li><li>Tes awal serta evaluasi performa berkala.</li><li>Pengaturan pemulihan, gizi, dan pencegahan cedera.</li><li>Simulasi pertandingan dan uji tanding sesuai kebutuhan cabang.</li></ul>",
  },
  {
    kind: ContentKind.PROGRAM,
    slug: "sport-for-all",
    title: "Gerakan Olahraga untuk Semua",
    category: "Masyarakat",
    status: ContentStatus.ACTIVE,
    publishedAt: "2026-07-03T08:00:00+08:00",
    sourceTitle: "Kemenpora — Panduan Hari Olahraga Nasional 2025",
    sourceUrl: "https://image.kemenpora.go.id/files/pengumuman_file/2025/09/05/79/1716Buku-Panduan-HAORNAS-2025.pdf",
    summary: "<p>Gerakan Olahraga untuk Semua mendorong kebiasaan aktif di sekolah, desa, kecamatan, komunitas, dan lingkungan kerja.</p><p>Kegiatan dapat berupa senam bersama, jalan sehat, permainan tradisional, liga komunitas, serta pemanfaatan ruang publik untuk aktivitas fisik yang aman dan inklusif.</p>",
  },
  {
    kind: ContentKind.PROGRAM,
    slug: "talent-scouting-porprov-2026",
    title: "Talent Scouting Menuju Porprov 2026",
    category: "Seleksi Atlet",
    status: ContentStatus.ACTIVE,
    publishedAt: "2026-07-04T08:00:00+08:00",
    sourceTitle: "Bikasmedia — Seleksi Futsal Konawe Selatan Menuju Porprov 2026",
    sourceUrl: "https://bikasmedia.com/afk-konsel-sukses-gelar-seleksi-futsal-menuju-porprov-2026-ameeraa-fc-keluar-sebagai-juara/",
    summary: "<p>Talent scouting membantu cabang olahraga menemukan atlet potensial melalui turnamen, seleksi terbuka, kompetisi pelajar, dan rekomendasi klub.</p><p>Setiap kandidat dinilai berdasarkan kemampuan teknik, kondisi fisik, disiplin, riwayat pertandingan, dan kesiapan mengikuti program latihan lanjutan.</p>",
  },
  {
    kind: ContentKind.PROGRAM,
    slug: "peningkatan-kapasitas-pelatih",
    title: "Peningkatan Kapasitas Pelatih dan Tenaga Keolahragaan",
    category: "Pelatihan",
    status: ContentStatus.ACTIVE,
    publishedAt: "2026-07-05T08:00:00+08:00",
    sourceTitle: "Kemenpora — Rapat Koordinasi Program Stakeholder Sentra",
    sourceUrl: "https://deputi3.kemenpora.go.id/detail/216/kemenpora-gelar-rapat-koordinasi-program-stakeholder-sentra",
    summary: "<p>Kualitas atlet bertumbuh bersama kualitas pelatih dan tenaga pendukung. Program ini diarahkan pada peningkatan kompetensi kepelatihan, penyusunan periodisasi, pengelolaan data, pertolongan pertama, gizi, dan sport science.</p><p>Pelatih didorong membangun catatan latihan dan evaluasi yang dapat digunakan untuk mengukur perkembangan atlet secara objektif.</p>",
  },
  {
    kind: ContentKind.PROGRAM,
    slug: "basis-data-dan-evaluasi-prestasi",
    title: "Basis Data dan Evaluasi Prestasi",
    category: "Tata Kelola",
    status: ContentStatus.ACTIVE,
    publishedAt: "2026-07-06T08:00:00+08:00",
    sourceTitle: "Kemenpora — Profil Pembinaan Olahragawan Elit",
    sourceUrl: "https://smepbdsi.kemenpora.go.id/profile",
    summary: "<p>Program ini menata profil atlet, pelatih, hasil tes, riwayat kompetisi, dan capaian medali sebagai dasar pengambilan keputusan.</p><p>Data yang konsisten membantu KONI dan cabang olahraga menentukan prioritas pembinaan, mengevaluasi efektivitas latihan, serta menyiapkan kebutuhan kompetisi secara lebih akuntabel.</p>",
  },
  ...[
    ["atletik", "Atletik", "Perorangan", "Pembinaan mencakup nomor lari, lompat, dan lempar. Atletik juga menjadi salah satu cabang yang menghasilkan medali bagi pelajar Konawe Selatan pada O2SN kabupaten."],
    ["renang", "Renang", "Akuatik", "Pembinaan renang berfokus pada penguasaan teknik, daya tahan, keselamatan air, dan pengalaman bertanding secara bertahap."],
    ["sepak-bola", "Sepak Bola", "Beregu", "Sepak bola memiliki jalur pembinaan melalui sekolah, klub, dan kompetisi pelajar. Tim pelajar Konawe Selatan meraih juara Popda Sulawesi Tenggara 2025."],
    ["futsal", "Futsal", "Beregu", "Futsal menjadi ruang pencarian bakat dari klub dan komunitas. Seleksi tingkat kabupaten pada Juni 2026 digunakan untuk memantau calon atlet menuju Porprov."],
    ["bola-voli", "Bola Voli", "Beregu", "Pembinaan bola voli diarahkan pada penguasaan teknik, kerja sama tim, kondisi fisik, dan kompetisi berjenjang."],
    ["bulu-tangkis", "Bulu Tangkis", "Raket", "Pembinaan bulu tangkis dimulai dari teknik dasar, footwork, stamina, strategi pertandingan, dan partisipasi pada kompetisi pelajar."],
    ["pencak-silat", "Pencak Silat", "Bela Diri", "Pencak silat mengembangkan kemampuan tanding dan seni sekaligus disiplin, pengendalian diri, serta penghormatan terhadap nilai budaya."],
    ["panjat-tebing", "Panjat Tebing", "Ketangkasan", "Pembinaan panjat tebing memperhatikan teknik, kekuatan, keselamatan, dan ketahanan mental. Atlet pelajar Konawe Selatan meraih emas putra dan putri pada O2SN kabupaten 2026."],
    ["taekwondo", "Taekwondo", "Bela Diri", "Taekwondo merupakan salah satu cabang berprestasi Konawe Selatan. Tim daerah menjadi juara umum cabang taekwondo pada Porprov XIII Sultra 2018."],
    ["karate", "Karate", "Bela Diri", "Pembinaan karate meliputi kihon, kata, kumite, kebugaran, disiplin, dan kesiapan kompetisi sesuai kelompok usia."],
    ["kempo", "Kempo", "Bela Diri", "Kempo Konawe Selatan pernah meraih juara umum kedua Popda II Sultra 2021 dengan raihan satu emas, dua perak, dan tiga perunggu."],
    ["angkat-besi", "Angkat Besi", "Kekuatan", "Pembinaan angkat besi menekankan teknik yang aman, mobilitas, kekuatan bertahap, pengawasan pelatih, serta evaluasi performa."],
  ].map(([slug, title, category, description], index): SeedItem => ({
    kind: ContentKind.SPORT_BRANCH,
    slug,
    title,
    category,
    status: ContentStatus.ACTIVE,
    publishedAt: `2026-07-${String(10 + index).padStart(2, "0")}T08:00:00+08:00`,
    sourceTitle: index === 8 ? "ANTARA — Taekwondo Konsel Juara Umum Porprov" : index === 10 ? "SultraKini — Atlet Kempo Konsel Raih Medali Popda" : index === 2 ? "Sultrack — Sepak Bola Konsel Juara Popda" : index === 3 ? "Bikasmedia — Seleksi Futsal Konsel" : index === 7 ? "SMAN 1 Konawe Selatan — Hasil O2SN 2026" : "KONI Pusat — Pembinaan dan Pengembangan Olahraga Prestasi",
    sourceUrl: index === 8 ? "https://sultra.antaranews.com/berita/297817/porprov-sultra-konsel-juara-cabang-taekwondo" : index === 10 ? "https://sultrakini.com/pemda-konsel-apresiasi-atlet-kempo-raih-medali-di-popda-ii-sultra/" : index === 2 ? "https://sultrack.com/2025/10/26/tim-sepak-bola-konsel-jawara-dalam-ajang-popda-se-sultra/" : index === 3 ? "https://bikasmedia.com/afk-konsel-sukses-gelar-seleksi-futsal-menuju-porprov-2026-ameeraa-fc-keluar-sebagai-juara/" : index === 7 ? "https://sman1konaweselatan.sch.id/read/136/sman-1-konawe-selatan-raih-juara-1-umum-o2sn-tingkat-kabupaten-tahun-2026" : KONI_SOURCE,
    summary: `<p>${description}</p><p>Informasi seleksi, jadwal latihan, dan kegiatan cabang disampaikan melalui pengurus cabang olahraga dan sekretariat KONI Konawe Selatan.</p>`,
  })),
  ...[
    ["musda-koni-konsel-2026", "Musyawarah Daerah KONI Konawe Selatan 2026", "Organisasi", "Dokumentasi Musda KONI Konawe Selatan di Wonua Monapa, Ranomeeto, yang menetapkan ketua periode 2026–2031.", "https://www.oyisultra.com/2026/06/20/wakil-bupati-wahyu-imran-resmi-pimpin-koni-konawe-selatan/", "2026-06-20"],
    ["seleksi-futsal-porprov-2026", "Turnamen dan Seleksi Futsal Porprov 2026", "Seleksi Atlet", "Momen pertandingan, penyerahan penghargaan, dan pemantauan pemain pada seleksi futsal Konawe Selatan.", "https://bikasmedia.com/afk-konsel-sukses-gelar-seleksi-futsal-menuju-porprov-2026-ameeraa-fc-keluar-sebagai-juara/", "2026-06-14"],
    ["o2sn-konawe-selatan-2026", "O2SN Kabupaten Konawe Selatan 2026", "Olahraga Pelajar", "Rekam prestasi atlet pelajar pada cabang pencak silat, bulu tangkis, renang, panjat tebing, dan atletik.", "https://sman1konaweselatan.sch.id/read/136/sman-1-konawe-selatan-raih-juara-1-umum-o2sn-tingkat-kabupaten-tahun-2026", "2026-06-16"],
    ["sepak-bola-popda-sultra-2025", "Final Sepak Bola Popda Sulawesi Tenggara 2025", "Kejuaraan", "Dokumentasi perjuangan tim pelajar Konawe Selatan hingga meraih medali emas melalui final yang ditentukan lewat adu penalti.", "https://sultrack.com/2025/10/26/tim-sepak-bola-konsel-jawara-dalam-ajang-popda-se-sultra/", "2025-10-26"],
    ["kontingen-porprov-xiv-sultra", "Perjalanan Kontingen pada Porprov XIV Sultra", "Porprov", "Arsip capaian kontingen Konawe Selatan yang mengumpulkan 159 medali dan menempati peringkat keempat Porprov XIV Sultra.", "https://sultra.antaranews.com/berita/435383/kendari-juara-umum-porprov-xiv-sultra-2022", "2022-12-04"],
    ["taekwondo-porprov-xiii-sultra", "Taekwondo Konawe Selatan di Porprov XIII Sultra", "Prestasi", "Dokumentasi tim taekwondo Konawe Selatan setelah meraih empat emas, satu perak, tiga perunggu, dan gelar juara umum cabang.", "https://sultra.antaranews.com/berita/297817/porprov-sultra-konsel-juara-cabang-taekwondo", "2018-12-13"],
  ].map(([slug, title, category, description, sourceUrl, date]): SeedItem => ({
    kind: ContentKind.GALLERY,
    slug,
    title,
    category,
    status: ContentStatus.PUBLISHED,
    publishedAt: `${date}T08:00:00+08:00`,
    sourceTitle: `Referensi dokumentasi — ${title}`,
    sourceUrl,
    summary: `<p>${description}</p>`,
  })),
  ...[
    ["porprov-xiv-159-medali", "159 Medali pada Porprov XIV Sulawesi Tenggara", "Multi Cabor", "Konawe Selatan menempati peringkat keempat dengan 45 emas, 52 perak, dan 62 perunggu.", "https://sultra.antaranews.com/berita/435383/kendari-juara-umum-porprov-xiv-sultra-2022", "2022-12-04"],
    ["taekwondo-juara-umum-porprov-2018", "Juara Umum Taekwondo Porprov XIII Sultra", "Taekwondo", "Tim taekwondo Konawe Selatan meraih empat emas, satu perak, dan tiga perunggu.", "https://sultra.antaranews.com/berita/297817/porprov-sultra-konsel-juara-cabang-taekwondo", "2018-12-13"],
    ["sepak-bola-emas-popda-2025", "Medali Emas Sepak Bola Popda Sultra 2025", "Sepak Bola", "Tim pelajar Konawe Selatan menjadi juara setelah menang adu penalti 4–3 pada laga final.", "https://sultrack.com/2025/10/26/tim-sepak-bola-konsel-jawara-dalam-ajang-popda-se-sultra/", "2025-10-26"],
    ["sman-1-juara-umum-o2sn-2026", "Juara Umum O2SN Kabupaten 2026", "Olahraga Pelajar", "SMAN 1 Konawe Selatan mengumpulkan lima emas dan dua perak serta melaju mewakili kabupaten ke tingkat provinsi.", "https://sman1konaweselatan.sch.id/read/136/sman-1-konawe-selatan-raih-juara-1-umum-o2sn-tingkat-kabupaten-tahun-2026", "2026-06-16"],
    ["vincent-juara-bulu-tangkis-o2sn-2026", "Juara Tunggal Putra Bulu Tangkis O2SN 2026", "Bulu Tangkis", "Vincent Kenpadidi dari SMAN 8 Konawe Selatan memenangi final O2SN kabupaten melalui rubber game.", "https://linksultra.com/vincent-kenpadidi-juara-o2sn-bulu-tangkis-tunggal-putra-harumkan-nama-sman-8-konawe-selatan/", "2026-06-16"],
    ["kempo-juara-dua-popda-2021", "Juara Umum Kedua Kempo Popda II Sultra", "Kempo", "Atlet Kempo Konawe Selatan meraih satu emas, dua perak, dan tiga perunggu pada Popda II Sulawesi Tenggara.", "https://sultrakini.com/pemda-konsel-apresiasi-atlet-kempo-raih-medali-di-popda-ii-sultra/", "2021-04-05"],
    ["armianto-perunggu-fornas-2025", "Armianto Raih Perunggu FORNAS VIII 2025", "Binaraga dan Fitness", "Armianto, atlet asal Konawe Selatan, mempersembahkan medali perunggu kelas Men Sport Model pada FORNAS VIII NTB 2025.", "https://mediakendari.com/dari-keringat-ke-panggung-juara-perunggu-pertama-perbafi-sultra-di-fornas-viii-ntb-2025/", "2025-08-01"],
  ].map(([slug, title, category, description, sourceUrl, date]): SeedItem => ({
    kind: ContentKind.ACHIEVEMENT,
    slug,
    title,
    category,
    status: ContentStatus.PUBLISHED,
    publishedAt: `${date}T08:00:00+08:00`,
    sourceTitle: `Sumber capaian — ${title}`,
    sourceUrl,
    summary: `<p>${description}</p>`,
  })),
];

const obsoleteSeedItems = [
  [ContentKind.NEWS, "koni-lepas-kontingen-porprov-2024"],
  [ContentKind.NEWS, "atlet-renang-raih-tiga-medali"],
  [ContentKind.NEWS, "pelatihan-pelatih-dan-official"],
  [ContentKind.GALLERY, "pelepasan-kontingen"],
  [ContentKind.GALLERY, "kejuaraan-renang"],
  [ContentKind.GALLERY, "pelatihan-official"],
  [ContentKind.ACHIEVEMENT, "aulia-rahman-kejurprov"],
  [ContentKind.ACHIEVEMENT, "tim-karate-konsel"],
  [ContentKind.ACHIEVEMENT, "kontingen-porprov"],
] as const;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@konikonsel.id";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("ADMIN_PASSWORD wajib diisi sebelum menjalankan seed");

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { name: "Admin KONI", role: "SUPER_ADMIN", isActive: true },
    create: { name: "Admin KONI", email: adminEmail.toLowerCase(), passwordHash: await hash(adminPassword, 12), role: "SUPER_ADMIN" },
  });

  await prisma.contentItem.deleteMany({ where: { OR: obsoleteSeedItems.map(([kind, slug]) => ({ kind, slug })) } });

  for (const item of items) {
    const { sourceTitle, sourceUrl, viewCount = 0, publishedAt, ...content } = item;
    const data = { ...content, publishedAt: new Date(publishedAt), metadata: { sourceTitle, sourceUrl } };
    await prisma.contentItem.upsert({
      where: { kind_slug: { kind: item.kind, slug: item.slug } },
      update: data,
      create: { ...data, viewCount },
    });
  }

  console.log(`Seed selesai: ${items.length} konten terstruktur dan bersumber tersedia.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
