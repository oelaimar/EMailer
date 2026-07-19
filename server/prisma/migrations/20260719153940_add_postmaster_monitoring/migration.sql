-- AlterTable
ALTER TABLE `PostmasterAccount` ADD COLUMN `connection_status` VARCHAR(191) NULL DEFAULT 'Unknown',
    ADD COLUMN `last_checked` DATETIME(3) NULL,
    ADD COLUMN `last_error` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PostmasterMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `uid` INTEGER NOT NULL,
    `folder` VARCHAR(191) NOT NULL DEFAULT 'INBOX',
    `from` VARCHAR(191) NOT NULL,
    `to` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `body_html` TEXT NULL,
    `body_text` TEXT NULL,
    `raw_headers` TEXT NULL,
    `isBlacklisted` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PostmasterMessage_accountId_idx`(`accountId`),
    UNIQUE INDEX `PostmasterMessage_accountId_message_id_key`(`accountId`, `message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostmasterRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'running',
    `messageCount` INTEGER NOT NULL DEFAULT 0,
    `newCount` INTEGER NOT NULL DEFAULT 0,
    `error_log` TEXT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,

    INDEX `PostmasterRun_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PostmasterMessage` ADD CONSTRAINT `PostmasterMessage_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `PostmasterAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostmasterRun` ADD CONSTRAINT `PostmasterRun_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `PostmasterAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
