CREATE TABLE `pageviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`path` text NOT NULL,
	`referrer_source` text DEFAULT 'direct' NOT NULL,
	`device_type` text DEFAULT 'unknown' NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pageviews_daily_dimension_unique` ON `pageviews` (`date`,`path`,`referrer_source`,`device_type`);