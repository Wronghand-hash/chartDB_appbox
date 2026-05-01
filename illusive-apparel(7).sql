CREATE TABLE `users` (
  `id` uuid PRIMARY KEY,
  `email` text,
  `last_sign_in` timestamp
);

CREATE TABLE `profiles` (
  `id` uuid PRIMARY KEY,
  `full_name` text,
  `email` text,
  `phone` text,
  `role` Enum
);

CREATE TABLE `customers` (
  `id` uuid PRIMARY KEY,
  `profile_id` uuid,
  `company_name` text,
  `company_logo` text,
  `first_name` text,
  `last_name` text,
  `email` text,
  `phone` text,
  `fax` text,
  `is_billing_contact` boolean,
  `corporate_primary_color` text,
  `corporate_secondary_color` text,
  `additional_internal_notes` text,
  `tax_exempt` boolean,
  `sales_tax` float,
  `resale_no` text,
  `tax_form` text,
  `owner_profile_id` uuid,
  `po_enabled` boolean,
  `status` text
);

CREATE TABLE `customer_contacts` (
  `id` uuid PRIMARY KEY,
  `customer_id` uuid,
  `name` text,
  `email` text,
  `phone` text,
  `fax` text,
  `is_billing_contact` boolean
);

CREATE TABLE `customer_address` (
  `id` uuid PRIMARY KEY,
  `customer_id` uuid,
  `type` ENUM,
  `address_line_1` text,
  `address_line_2` text,
  `city` text,
  `state` text,
  `zip` text,
  `country` text
);

CREATE TABLE `system_settings` (
  `id` uuid PRIMARY KEY,
  `company_name` text,
  `contact_email` text,
  `company_logo_bright` text,
  `company_logo_dark` text,
  `document_starting_number` int,
  `customer_art_fee_enabled` boolean,
  `customer_art_fee_amount` float
);

CREATE TABLE `saved_fees` (
  `id` uuid PRIMARY KEY,
  `label` text,
  `amount` float,
  `is_percentage` boolean,
  `is_taxed` boolean
);

CREATE TABLE `tax_rates` (
  `id` uuid PRIMARY KEY,
  `state_code` text,
  `state_name` text,
  `percentage_rate` float
);

CREATE TABLE `email_templates` (
  `id` uuid PRIMARY KEY,
  `template_name` text,
  `subject` text,
  `body` text
);

CREATE TABLE `production_statuses` (
  `label` text PRIMARY KEY,
  `color` text,
  `sort_order` int
);

CREATE TABLE `production_status_roles` (
  `id` uuid PRIMARY KEY,
  `status_id` uuid,
  `role` Enum
);

CREATE TABLE `invoices` (
  `id` uuid PRIMARY KEY,
  `quote_id` uuid,
  `type` enum,
  `created_date` date,
  `amount` float8,
  `status` enum
);

CREATE TABLE `quotes` (
  `id` uuid PRIMARY KEY,
  `customer_id` uuid,
  `owner_profile_id` uuid,
  `name` text,
  `po_number` text,
  `customer_note` text,
  `production_note` text,
  `quote_status` enum,
  `production_status_id` uuid,
  `quote_number` text,
  `created_date` date,
  `production_due` date,
  `customer_due` date,
  `payment_due` date
);

CREATE TABLE `quote_art_files` (
  `id` uuid PRIMARY KEY,
  `line_item` uuid,
  `file` text,
  `status` enum,
  `status_change_date` datetime
);

CREATE TABLE `quote_history` (
  `id` uuid PRIMARY KEY,
  `message` text,
  `quote_id` uuid,
  `profile_id` uuid,
  `created_date` date
);

CREATE TABLE `quote_design_groups` (
  `quote_id` uuid,
  `id` uuid PRIMARY KEY,
  `name` text
);

CREATE TABLE `quote_line_items` (
  `id` uuid PRIMARY KEY,
  `name` text,
  `design_group` uuid,
  `product_id` uuid,
  `print_method` uuid,
  `print_placements` enum[],
  `number_of_colours` text,
  `attachments` text,
  `is_print_ready` boolean,
  `preferred_colour` text,
  `estimated_quantity` int,
  `is_repeat` boolean
);

CREATE TABLE `quote_line_items_size_stock` (
  `id` uuid PRIMARY KEY,
  `line_item` uuid,
  `size` uuid,
  `stock` int8
);

CREATE TABLE `quote_line_items_color_stock` (
  `id` uuid PRIMARY KEY,
  `line_item` uuid,
  `colour` uuid,
  `stock` int8
);

CREATE TABLE `quote_fees` (
  `id` uuid PRIMARY KEY,
  `quote_id` uuid,
  `description` text,
  `quantity` float,
  `amount` float,
  `is_percentage` boolean,
  `is_taxed` boolean,
  `saved_fee_id` uuid
);

CREATE TABLE `campaign_themes` (
  `id` uuid PRIMARY KEY,
  `name` text,
  `category` enum,
  `description` text,
  `hero_banner_url` text,
  `about_image_url` text,
  `gallery` text[]
);

CREATE TABLE `campaigns` (
  `id` uuid PRIMARY KEY,
  `quote_id` uuid,
  `name` text,
  `url` text,
  `created_date` date,
  `close_date` date,
  `theme` uuid,
  `announcement_text` text,
  `headline_text` text,
  `hero_subtext` text,
  `cta_text` text,
  `about_text` text,
  `footer_text` text,
  `banner_url` text,
  `banner_text_color` text,
  `use_customer_branding_colors` boolean,
  `margin_percentage` float8,
  `shipping_method` enum[],
  `delivery_instruction` text,
  `enable_fulfillment_emails` boolean,
  `display_countdown_timer` boolean,
  `auto_close_store` boolean,
  `auto_generate_invoices` boolean,
  `is_password_protected` boolean,
  `store_password` text,
  `sale_tax` enum
);

CREATE TABLE `campaign_coupons` (
  `id` uuid PRIMARY KEY,
  `campaign_id` uuid,
  `code` text,
  `is_discount_percentage` boolean,
  `discount` float8,
  `max_redemptions` int8,
  `expires_at` date
);

CREATE TABLE `campaign_address` (
  `id` uuid PRIMARY KEY,
  `campaign_id` uuid,
  `location` text,
  `address_1` text,
  `address_2` text,
  `city` text,
  `state` text,
  `country` text
);

CREATE TABLE `campaign_line_items` (
  `id` uuid PRIMARY KEY,
  `campaign_id` uuid,
  `quote_line_item_id` uuid,
  `sell_cost` float8
);

CREATE TABLE `campaign_line_item_size_stock` (
  `id` uuid PRIMARY KEY,
  `campaign_line_item` uuid,
  `stock` int8,
  `size` uuid
);

CREATE TABLE `campaign_line_item_colour_stock` (
  `id` uuid PRIMARY KEY,
  `campaign_line_item` uuid,
  `stock` int8,
  `colour` uuid
);

CREATE TABLE `jobs` (
  `id` uuid PRIMARY KEY,
  `order_id` uuid,
  `priority` enum,
  `due_date` date,
  `status` enum
);

CREATE TABLE `job_assignees` (
  `id` uuid PRIMARY KEY,
  `job_id` uuid,
  `profile_id` uuid
);

CREATE TABLE `individual_campaign_orders` (
  `id` uuid PRIMARY KEY,
  `campaign` uuid,
  `coupon_id` uuid,
  `created_date` date,
  `paid` boolean,
  `first_name` text,
  `last_name` text,
  `email` text,
  `phone` text,
  `billing_same_as_shipping` boolean,
  `delivery_method` enum
);

CREATE TABLE `individual_campaign_order_items` (
  `id` uuid PRIMARY KEY,
  `order_id` uuid,
  `size` uuid,
  `colour` uuid,
  `quantity` int8
);

CREATE TABLE `order_shipping_address` (
  `id` uuid PRIMARY KEY,
  `order_id` uuid,
  `address` text,
  `apt` text,
  `city` text,
  `state` text,
  `country` text
);

CREATE TABLE `print_methods` (
  `id` uuid PRIMARY KEY,
  `name` text,
  `setup_fee` float,
  `repeat_fee` float,
  `digital_conversion_enabled` boolean,
  `digital_conversion_threshold` int
);

CREATE TABLE `print_quantity_tiers` (
  `id` uuid PRIMARY KEY,
  `print_method_id` uuid,
  `min_quantity` int,
  `max_quantity` int
);

CREATE TABLE `print_pricing_options` (
  `id` uuid PRIMARY KEY,
  `name` text
);

CREATE TABLE `print_pricing_option_rates` (
  `id` uuid PRIMARY KEY,
  `pricing_option_id` uuid,
  `quantity_tier_id` uuid,
  `price` float
);

CREATE TABLE `categories` (
  `id` uuid PRIMARY KEY,
  `name` varchar(255),
  `has_colour_variant` boolean,
  `has_size_variant` boolean
);

CREATE TABLE `suppliers` (
  `name` text
);

CREATE TABLE `products` (
  `id` uuid PRIMARY KEY,
  `name` varchar(255),
  `supplier` text,
  `category_id` uuid
);

CREATE TABLE `price_tiers` (
  `id` uuid PRIMARY KEY,
  `product_id` uuid,
  `min_quantity` int,
  `max_quantity` int,
  `price` decimal
);

CREATE TABLE `colours` (
  `id` uuid PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `sizes` (
  `id` uuid PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `product_variants` (
  `id` uuid PRIMARY KEY,
  `product_id` uuid,
  `colour_id` uuid,
  `size_id` uuid,
  `stock` int
);

CREATE TABLE `automations` (
  `id` uuid PRIMARY KEY,
  `name` text,
  `enabled` boolean,
  `trigger` uuid,
  `trigger_status` text,
  `delay` uuid,
  `action` uuid,
  `action_status` text
);

CREATE TABLE `automation_triggers` (
  `trigger_type` text PRIMARY KEY,
  `trigger_value` text,
  `has_dynamic_status` boolean
);

CREATE TABLE `automation_delays` (
  `delay_type` text PRIMARY KEY,
  `delay_seconds` int
);

CREATE TABLE `automation_actions` (
  `action_type` text PRIMARY KEY,
  `action_value` text,
  `has_dynamic_status` boolean,
  `forbid_matching_trigger_status` boolean
);

CREATE TABLE `automation_channels` (
  `id` uuid PRIMARY KEY,
  `automation_id` uuid,
  `emails` text,
  `team_member` uuid,
  `phone_numbers` text,
  `automated_email` uuid,
  `automated_sms` uuid
);

CREATE TABLE `automation_email` (
  `id` uuid PRIMARY KEY,
  `subject` text,
  `body` text
);

CREATE TABLE `automation_sms` (
  `id` uuid PRIMARY KEY,
  `body` text
);

CREATE TABLE `automation_runs` (
  `id` uuid PRIMARY KEY,
  `automation_id` uuid,
  `entity_id` uuid,
  `run_at` datetime,
  `status` enum,
  `payload` jsonb,
  `created_at` datetime
);

CREATE TABLE `notifications` (
  `id` uuid PRIMARY KEY,
  `profile_id` uuid,
  `type` enum,
  `title` text,
  `message` text,
  `metadata` jsonb,
  `is_read` boolean
);

CREATE TABLE `internal_message_threads` (
  `id` uuid PRIMARY KEY,
  `type` enum,
  `name` text,
  `quote_id` uuid,
  `created_date` date
);

CREATE TABLE `message_threads_participants` (
  `id` uuid PRIMARY KEY,
  `profile_id` uuid,
  `thread_id` uuid
);

CREATE TABLE `thread_messages` (
  `id` uuid PRIMARY KEY,
  `chat_participant` uuid,
  `created_date` datetime
);

ALTER TABLE `profiles` ADD FOREIGN KEY (`id`) REFERENCES `users` (`id`);

ALTER TABLE `customers` ADD FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `customers` ADD FOREIGN KEY (`owner_profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `customer_contacts` ADD FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

ALTER TABLE `customer_address` ADD FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

ALTER TABLE `production_status_roles` ADD FOREIGN KEY (`status_id`) REFERENCES `production_statuses` (`label`);

ALTER TABLE `invoices` ADD FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`);

ALTER TABLE `quotes` ADD FOREIGN KEY (`customer_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `quotes` ADD FOREIGN KEY (`owner_profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `quotes` ADD FOREIGN KEY (`production_status_id`) REFERENCES `production_statuses` (`label`);

ALTER TABLE `quote_art_files` ADD FOREIGN KEY (`line_item`) REFERENCES `quote_line_items` (`id`);

ALTER TABLE `quote_history` ADD FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`);

ALTER TABLE `quote_history` ADD FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `quote_design_groups` ADD FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`);

ALTER TABLE `quote_line_items` ADD FOREIGN KEY (`design_group`) REFERENCES `quote_design_groups` (`id`);

ALTER TABLE `quote_line_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `quote_line_items` ADD FOREIGN KEY (`print_method`) REFERENCES `print_methods` (`id`);

ALTER TABLE `quote_line_items_size_stock` ADD FOREIGN KEY (`line_item`) REFERENCES `quote_line_items` (`id`);

ALTER TABLE `quote_line_items_size_stock` ADD FOREIGN KEY (`size`) REFERENCES `sizes` (`id`);

ALTER TABLE `quote_line_items_color_stock` ADD FOREIGN KEY (`line_item`) REFERENCES `quote_line_items` (`id`);

ALTER TABLE `quote_line_items_color_stock` ADD FOREIGN KEY (`colour`) REFERENCES `colours` (`id`);

ALTER TABLE `quote_fees` ADD FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`);

ALTER TABLE `quote_fees` ADD FOREIGN KEY (`saved_fee_id`) REFERENCES `saved_fees` (`id`);

ALTER TABLE `campaigns` ADD FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`);

ALTER TABLE `campaigns` ADD FOREIGN KEY (`theme`) REFERENCES `campaign_themes` (`id`);

ALTER TABLE `campaign_coupons` ADD FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`);

ALTER TABLE `campaign_address` ADD FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`);

ALTER TABLE `campaign_line_items` ADD FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`);

ALTER TABLE `campaign_line_items` ADD FOREIGN KEY (`quote_line_item_id`) REFERENCES `quote_line_items` (`id`);

ALTER TABLE `campaign_line_item_size_stock` ADD FOREIGN KEY (`campaign_line_item`) REFERENCES `campaign_line_items` (`id`);

ALTER TABLE `campaign_line_item_size_stock` ADD FOREIGN KEY (`size`) REFERENCES `sizes` (`id`);

ALTER TABLE `campaign_line_item_colour_stock` ADD FOREIGN KEY (`campaign_line_item`) REFERENCES `campaign_line_items` (`id`);

ALTER TABLE `campaign_line_item_colour_stock` ADD FOREIGN KEY (`colour`) REFERENCES `colours` (`id`);

ALTER TABLE `jobs` ADD FOREIGN KEY (`order_id`) REFERENCES `individual_campaign_orders` (`id`);

ALTER TABLE `job_assignees` ADD FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`);

ALTER TABLE `job_assignees` ADD FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `individual_campaign_orders` ADD FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`);

ALTER TABLE `individual_campaign_orders` ADD FOREIGN KEY (`coupon_id`) REFERENCES `campaign_coupons` (`id`);

ALTER TABLE `individual_campaign_order_items` ADD FOREIGN KEY (`order_id`) REFERENCES `individual_campaign_orders` (`id`);

ALTER TABLE `individual_campaign_order_items` ADD FOREIGN KEY (`size`) REFERENCES `campaign_line_item_size_stock` (`id`);

ALTER TABLE `individual_campaign_order_items` ADD FOREIGN KEY (`colour`) REFERENCES `campaign_line_item_colour_stock` (`id`);

ALTER TABLE `order_shipping_address` ADD FOREIGN KEY (`order_id`) REFERENCES `individual_campaign_orders` (`id`);

ALTER TABLE `print_quantity_tiers` ADD FOREIGN KEY (`print_method_id`) REFERENCES `print_methods` (`id`);

ALTER TABLE `print_pricing_option_rates` ADD FOREIGN KEY (`pricing_option_id`) REFERENCES `print_pricing_options` (`id`);

ALTER TABLE `print_pricing_option_rates` ADD FOREIGN KEY (`quantity_tier_id`) REFERENCES `print_quantity_tiers` (`id`);

ALTER TABLE `products` ADD FOREIGN KEY (`supplier`) REFERENCES `suppliers` (`name`);

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `price_tiers` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `product_variants` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `product_variants` ADD FOREIGN KEY (`colour_id`) REFERENCES `colours` (`id`);

ALTER TABLE `product_variants` ADD FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`);

ALTER TABLE `automations` ADD FOREIGN KEY (`trigger`) REFERENCES `automation_triggers` (`trigger_type`);

ALTER TABLE `automations` ADD FOREIGN KEY (`trigger_status`) REFERENCES `production_statuses` (`label`);

ALTER TABLE `automations` ADD FOREIGN KEY (`delay`) REFERENCES `automation_delays` (`delay_type`);

ALTER TABLE `automations` ADD FOREIGN KEY (`action`) REFERENCES `automation_actions` (`action_type`);

ALTER TABLE `automations` ADD FOREIGN KEY (`action_status`) REFERENCES `production_statuses` (`label`);

ALTER TABLE `automation_channels` ADD FOREIGN KEY (`automation_id`) REFERENCES `automations` (`id`);

ALTER TABLE `automation_channels` ADD FOREIGN KEY (`team_member`) REFERENCES `profiles` (`id`);

ALTER TABLE `automation_channels` ADD FOREIGN KEY (`automated_email`) REFERENCES `automation_email` (`id`);

ALTER TABLE `automation_channels` ADD FOREIGN KEY (`automated_sms`) REFERENCES `automation_sms` (`id`);

ALTER TABLE `automation_runs` ADD FOREIGN KEY (`automation_id`) REFERENCES `automations` (`id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `internal_message_threads` ADD FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`);

ALTER TABLE `message_threads_participants` ADD FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`);

ALTER TABLE `message_threads_participants` ADD FOREIGN KEY (`thread_id`) REFERENCES `internal_message_threads` (`id`);

ALTER TABLE `thread_messages` ADD FOREIGN KEY (`chat_participant`) REFERENCES `message_threads_participants` (`id`);
