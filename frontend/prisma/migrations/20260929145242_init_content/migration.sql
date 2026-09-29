-- CreateTable
CREATE TABLE `ContentItem` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('NEWS', 'PROGRAM', 'SPORT_BRANCH', 'GALLERY', 'ACHIEVEMENT') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `summary` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ACTIVE', 'SCHEDULED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `metadata` JSON NULL,
    `publishedAt` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContentItem_kind_status_createdAt_idx`(`kind`, `status`, `createdAt`),
    INDEX `ContentItem_kind_title_idx`(`kind`, `title`),
    UNIQUE INDEX `ContentItem_kind_slug_key`(`kind`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
