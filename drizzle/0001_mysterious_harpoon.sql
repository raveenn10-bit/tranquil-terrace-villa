ALTER TABLE `bookings` ADD `villa_name` text DEFAULT 'Araliya' NOT NULL;--> statement-breakpoint
CREATE INDEX `bookings_villa_name_idx` ON `bookings` (`villa_name`);