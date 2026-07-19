-- CreateTable
CREATE TABLE `CustomVmta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `smtpGroupId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NULL,
    `port` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CustomVmta` ADD CONSTRAINT `CustomVmta_smtpGroupId_fkey` FOREIGN KEY (`smtpGroupId`) REFERENCES `SmtpGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
