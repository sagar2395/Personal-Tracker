ALTER TABLE `goals` ADD `why_it_matters` text;--> statement-breakpoint
ALTER TABLE `goals` ADD `impact_level` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` ADD `reward` text;--> statement-breakpoint
ALTER TABLE `goals` ADD `reward_claimed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` ADD `why_it_matters` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `impact_level` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` ADD `milestone_reward` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `impact_level` integer DEFAULT 2 NOT NULL;