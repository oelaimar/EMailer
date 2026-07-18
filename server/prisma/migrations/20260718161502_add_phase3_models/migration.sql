-- CreateTable
CREATE TABLE `Offer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `fromName` VARCHAR(191) NULL,
    `fromEmail` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `replyTo` VARCHAR(191) NULL,
    `headers` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Suppression` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `offerId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Email',
    `data` VARCHAR(191) NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AffiliateNetwork` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AutoResponder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `fromName` VARCHAR(191) NULL,
    `fromEmail` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `delay` INTEGER NOT NULL DEFAULT 0,
    `headers` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AutoResponderList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autoResponderId` INTEGER NOT NULL,
    `dataListId` INTEGER NOT NULL,

    UNIQUE INDEX `AutoResponderList_autoResponderId_dataListId_key`(`autoResponderId`, `dataListId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VirtualList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `smtpGroupId` INTEGER NULL,
    `mtaServerId` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Production` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SendProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionId` INTEGER NOT NULL,
    `dataListId` INTEGER NULL,
    `smtpGroupId` INTEGER NULL,
    `mtaServerId` INTEGER NULL,
    `offerId` INTEGER NULL,
    `virtualListId` INTEGER NULL,
    `processName` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `fromEmail` VARCHAR(191) NULL,
    `fromName` VARCHAR(191) NULL,
    `replyTo` VARCHAR(191) NULL,
    `senderScore` INTEGER NULL,
    `throttle` INTEGER NOT NULL DEFAULT 0,
    `speed` INTEGER NOT NULL DEFAULT 100,
    `scheduleAt` DATETIME(3) NULL,
    `repeat` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GmailAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `clientSecret` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `senderScore` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GmailAccount_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GSuiteAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `clientSecret` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `senderScore` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GSuiteAccount_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OutlookAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `clientSecret` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `tenantId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `senderScore` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OutlookAccount_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Suppression` ADD CONSTRAINT `Suppression_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AutoResponderList` ADD CONSTRAINT `AutoResponderList_autoResponderId_fkey` FOREIGN KEY (`autoResponderId`) REFERENCES `AutoResponder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AutoResponderList` ADD CONSTRAINT `AutoResponderList_dataListId_fkey` FOREIGN KEY (`dataListId`) REFERENCES `DataList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VirtualList` ADD CONSTRAINT `VirtualList_smtpGroupId_fkey` FOREIGN KEY (`smtpGroupId`) REFERENCES `SmtpGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VirtualList` ADD CONSTRAINT `VirtualList_mtaServerId_fkey` FOREIGN KEY (`mtaServerId`) REFERENCES `MtaServer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendProcess` ADD CONSTRAINT `SendProcess_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `Production`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendProcess` ADD CONSTRAINT `SendProcess_dataListId_fkey` FOREIGN KEY (`dataListId`) REFERENCES `DataList`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendProcess` ADD CONSTRAINT `SendProcess_smtpGroupId_fkey` FOREIGN KEY (`smtpGroupId`) REFERENCES `SmtpGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendProcess` ADD CONSTRAINT `SendProcess_mtaServerId_fkey` FOREIGN KEY (`mtaServerId`) REFERENCES `MtaServer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendProcess` ADD CONSTRAINT `SendProcess_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendProcess` ADD CONSTRAINT `SendProcess_virtualListId_fkey` FOREIGN KEY (`virtualListId`) REFERENCES `VirtualList`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
