CREATE TABLE `interface_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`source_interface_id` int NOT NULL,
	`target_interface_id` int NOT NULL,
	`link_type` enum('calls','depends_on','extends','implements','communicates_with') NOT NULL,
	`description` text,
	`api_endpoint` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interface_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_interfaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('frontend','backend','mobile','api','database') NOT NULL,
	`language` varchar(64) NOT NULL,
	`framework` varchar(64),
	`description` text,
	`generated_code` text,
	`dependencies` text,
	`version` varchar(32) DEFAULT '1.0.0',
	`status` enum('draft','active','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_interfaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `interface_links` ADD CONSTRAINT `interface_links_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interface_links` ADD CONSTRAINT `interface_links_source_interface_id_project_interfaces_id_fk` FOREIGN KEY (`source_interface_id`) REFERENCES `project_interfaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interface_links` ADD CONSTRAINT `interface_links_target_interface_id_project_interfaces_id_fk` FOREIGN KEY (`target_interface_id`) REFERENCES `project_interfaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_interfaces` ADD CONSTRAINT `project_interfaces_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;