-- AlterTable
ALTER TABLE `GeoManagerProcess` ADD COLUMN `deleted_rows` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `finished_at` DATETIME(3) NULL,
    ADD COLUMN `moved_rows` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `skipped_rows` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `source_schema` VARCHAR(191) NULL,
    ADD COLUMN `source_tables` JSON NULL,
    ADD COLUMN `started_at` DATETIME(3) NULL;
