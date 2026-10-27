CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`guest_name` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text NOT NULL,
	`checkin` text NOT NULL,
	`checkout` text NOT NULL,
	`guests` integer DEFAULT 2 NOT NULL,
	`source` text DEFAULT 'website' NOT NULL,
	`status` text DEFAULT 'inquiry' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`paid_amount` integer DEFAULT 0 NOT NULL,
	`special_request` text DEFAULT '' NOT NULL,
	`admin_notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_unique` ON `bookings` (`reference`);--> statement-breakpoint
CREATE INDEX `bookings_checkin_idx` ON `bookings` (`checkin`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `bookings_created_at_idx` ON `bookings` (`created_at`);