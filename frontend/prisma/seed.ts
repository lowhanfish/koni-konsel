import { ContentKind, ContentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const items = [
  [ContentKind.NEWS, "koni-lepas-kontingen-porprov-2024", "KONI Lepas Kontingen Porprov Sultra 2024", "Kegiatan", ContentStatus.PUBLISHED],
  [ContentKind.NEWS, "atlet-renang-raih-tiga-medali", "Atlet Renang Raih Tiga Medali di Kejurprov", "Prestasi", ContentStatus.PUBLISHED],
  [ContentKind.NEWS, "pelatihan-pelatih-dan-official", "Pelatihan Pelatih dan Official", "Pembinaan", ContentStatus.PUBLISHED],
  [ContentKind.PROGRAM, "pembinaan-atlet-muda", "Pembinaan Atlet Muda", "Pembinaan", ContentStatus.ACTIVE],
  [ContentKind.PROGRAM, "pemusatan-latihan-daerah", "Pemusatan Latihan Daerah", "Pelatihan", ContentStatus.ACTIVE],
  [ContentKind.PROGRAM, "sport-for-all", "Sport for All", "Masyarakat", ContentStatus.SCHEDULED],
  [ContentKind.SPORT_BRANCH, "atletik", "Atletik", "Perorangan", ContentStatus.ACTIVE],
  [ContentKind.SPORT_BRANCH, "renang", "Renang", "Akuatik", ContentStatus.ACTIVE],
  [ContentKind.SPORT_BRANCH, "sepak-bola", "Sepak Bola", "Beregu", ContentStatus.ACTIVE],
  [ContentKind.GALLERY, "pelepasan-kontingen", "Pelepasan Kontingen Porprov", "Kegiatan", ContentStatus.PUBLISHED],
  [ContentKind.GALLERY, "kejuaraan-renang", "Kejuaraan Renang Provinsi", "Kejuaraan", ContentStatus.PUBLISHED],
  [ContentKind.GALLERY, "pelatihan-official", "Pelatihan Pelatih & Official", "Pembinaan", ContentStatus.DRAFT],
  [ContentKind.ACHIEVEMENT, "aulia-rahman-kejurprov", "Aulia Rahman — 3 Emas Kejurprov Renang", "Renang", ContentStatus.PUBLISHED],
  [ContentKind.ACHIEVEMENT, "tim-karate-konsel", "Tim Karate Konsel — 5 Medali Kejurda", "Karate", ContentStatus.PUBLISHED],
  [ContentKind.ACHIEVEMENT, "kontingen-porprov", "Kontingen Konawe Selatan — 74 Medali Porprov", "Multi Cabor", ContentStatus.PUBLISHED],
] as const;

async function main() {
  await prisma.contentItem.createMany({
    data: items.map(([kind, slug, title, category, status], index) => ({
      kind,
      slug,
      title,
      category,
      status,
      summary: `Data awal ${title}. Silakan diperbarui melalui panel admin.`,
      publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
      viewCount: kind === ContentKind.NEWS ? 1200 - index * 137 : 0,
    })),
    skipDuplicates: true,
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
