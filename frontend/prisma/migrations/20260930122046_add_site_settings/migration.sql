-- CreateTable
CREATE TABLE `SiteSetting` (
    `id` VARCHAR(20) NOT NULL DEFAULT 'main',
    `organizationName` VARCHAR(191) NOT NULL DEFAULT 'KONI Kabupaten Konawe Selatan',
    `description` TEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `youtubeUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
