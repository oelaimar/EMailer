-- CreateTable
CREATE TABLE `VirtualListProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `virtualListId` INTEGER NOT NULL,
    `processName` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `totalEmails` INTEGER NOT NULL DEFAULT 0,
    `processedEmails` INTEGER NOT NULL DEFAULT 0,
    `filteredEmails` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElasticIp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cloudInstanceId` INTEGER NULL,
    `ipAddress` VARCHAR(191) NULL,
    `allocationId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `instanceId` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VirtualListProcess` ADD CONSTRAINT `VirtualListProcess_virtualListId_fkey` FOREIGN KEY (`virtualListId`) REFERENCES `VirtualList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElasticIp` ADD CONSTRAINT `ElasticIp_cloudInstanceId_fkey` FOREIGN KEY (`cloudInstanceId`) REFERENCES `CloudInstance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
