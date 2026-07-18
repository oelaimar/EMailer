-- CreateTable
CREATE TABLE `MtaServer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `serverProviderId` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `hostname` VARCHAR(191) NULL,
    `mainIp` VARCHAR(191) NOT NULL,
    `sshPort` INTEGER NOT NULL DEFAULT 22,
    `os` VARCHAR(191) NOT NULL DEFAULT 'ubuntu',
    `loginType` VARCHAR(191) NOT NULL DEFAULT 'user-pass',
    `username` VARCHAR(191) NOT NULL DEFAULT 'root',
    `password` VARCHAR(191) NULL,
    `pemFile` VARCHAR(191) NULL,
    `passphrase` VARCHAR(191) NULL,
    `ips` VARCHAR(191) NULL,
    `sshStatus` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `country` VARCHAR(191) NULL,
    `expirationDate` DATETIME(3) NULL,
    `lastChecked` DATETIME(3) NULL,
    `installationStatus` VARCHAR(191) NULL DEFAULT 'Not Installed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Domain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `availability` VARCHAR(191) NOT NULL DEFAULT 'Available',
    `expirationDate` DATETIME(3) NULL,
    `hasBrand` BOOLEAN NOT NULL DEFAULT false,
    `flag` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Domain_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DomainRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `domainId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `ttl` INTEGER NOT NULL DEFAULT 3600,
    `priority` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `emailCount` INTEGER NOT NULL DEFAULT 0,
    `country` VARCHAR(191) NULL,
    `vertical` VARCHAR(191) NULL,
    `isp` VARCHAR(191) NULL,
    `encryptEmails` VARCHAR(191) NOT NULL DEFAULT 'Disabled',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmtpGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `encryption` VARCHAR(191) NOT NULL DEFAULT 'None',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SmtpGroup_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proxy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'HTTP',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Activated',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DomainRecord` ADD CONSTRAINT `DomainRecord_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
