-- CreateTable
CREATE TABLE `CloudAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `apiKey` VARCHAR(191) NULL,
    `apiSecret` VARCHAR(191) NULL,
    `proxyIp` VARCHAR(191) NULL,
    `proxyPort` INTEGER NULL,
    `proxyUsername` VARCHAR(191) NULL,
    `proxyPassword` VARCHAR(191) NULL,
    `providerConfig` JSON NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CloudInstance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(191) NOT NULL,
    `cloudAccountId` INTEGER NULL,
    `numberOfInstances` INTEGER NOT NULL DEFAULT 1,
    `regions` JSON NULL,
    `dnsAccountId` INTEGER NULL,
    `os` VARCHAR(191) NOT NULL DEFAULT 'ubuntu-22.04',
    `instanceType` VARCHAR(191) NULL,
    `privateIps` INTEGER NOT NULL DEFAULT 1,
    `storage` INTEGER NOT NULL DEFAULT 10,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrarAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrar` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `apiKey` VARCHAR(191) NULL,
    `apiSecret` VARCHAR(191) NULL,
    `apiToken` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CloudInstance` ADD CONSTRAINT `CloudInstance_cloudAccountId_fkey` FOREIGN KEY (`cloudAccountId`) REFERENCES `CloudAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
