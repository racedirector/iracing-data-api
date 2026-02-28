import { z } from "zod";

/**
 * Nested types
 */
export const TrackDetailsTrackTypeSchema = z.object({
  track_type: z.enum(["road", "oval", "dirt_road", "dirt_oval"]),
});
export type TrackDetailsTrackTypeType = z.infer<
  typeof TrackDetailsTrackTypeSchema
>;

export const TrackDetailsCategorySchema = z.enum([
  "road",
  "oval",
  "dirt_road",
  "dirt_oval",
]);
export type TrackDetailsCategoryType = z.infer<
  typeof TrackDetailsCategorySchema
>;

/**
 * Main entry (one element of the JSON array)
 */
export const TrackDetailsSchema = z.object({
  ai_enabled: z.boolean(),

  allow_pitlane_collisions: z.boolean(),
  allow_rolling_start: z.boolean(),
  allow_standing_start: z.boolean(),

  award_exempt: z.boolean(),

  category: TrackDetailsCategorySchema,
  category_id: z.number().int(),

  // YYYY-MM-DD
  opens: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  closes: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  // Present for most entries, but not all
  config_name: z.string().optional(),

  corners_per_lap: z.number().int(),

  // ISO datetime w/ Z or offset
  created: z.string().datetime({ offset: true }),
  first_sale: z.string().datetime({ offset: true }),

  folder: z.string(),
  free_with_subscription: z.boolean(),

  fully_lit: z.boolean(),
  night_lighting: z.boolean(),

  grid_stalls: z.number().int(),

  has_opt_path: z.boolean(),
  has_short_parade_lap: z.boolean(),
  has_start_zone: z.boolean(),
  has_svg_map: z.boolean(),

  is_dirt: z.boolean(),
  is_oval: z.boolean(),
  is_ps_purchasable: z.boolean(),

  lap_scoring: z.number().int(),

  latitude: z.number(),
  longitude: z.number(),

  location: z.string(),

  logo: z.string(),

  max_cars: z.number().int(),

  // Missing for some entries
  nominal_lap_time: z.number().optional(),

  number_pitstalls: z.number().int(),

  package_id: z.number().int(),

  // Missing for some entries
  pit_road_speed_limit: z.number().int().optional(),

  // number (sometimes an int, sometimes a float)
  price: z.number(),

  // Missing for some entries
  price_display: z.string().optional(),

  priority: z.number().int(),

  purchasable: z.boolean(),

  qualify_laps: z.number().int(),

  rain_enabled: z.boolean(),

  restart_on_left: z.boolean(),
  retired: z.boolean(),

  search_filters: z.string(),

  // Missing for some entries
  site_url: z.string().optional(),

  sku: z.number().int(),

  small_image: z.string(),

  solo_laps: z.number().int(),

  start_on_left: z.boolean(),

  supports_grip_compound: z.boolean(),

  tech_track: z.boolean(),

  time_zone: z.string(),

  // number (sometimes an int, sometimes a float)
  track_config_length: z.number(),

  track_dirpath: z.string(),

  track_id: z.number().int(),
  track_name: z.string(),

  track_type: z.number().int(),
  track_type_text: z.string(),

  track_types: z.array(TrackDetailsTrackTypeSchema),

  // Present for some entries only
  banking: z.string().optional(),
});
export type TrackDetailsType = z.infer<typeof TrackDetailsSchema>;

/**
 * Whole file (JSON array)
 */
export const TrackDetailsArraySchema = TrackDetailsSchema.array();
export type TrackDetailsArrayType = z.infer<typeof TrackDetailsArraySchema>;
