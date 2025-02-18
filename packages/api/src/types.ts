export class IRacingAuthenticationError extends Error {
  constructor() {
    super("Failed to authenticate with iRacing.");
  }
}

export class InvalidResponseData extends Error {
  constructor() {
    super("Invalid response data");
  }
}

export class InvalidSessionError extends Error {
  constructor() {
    super("You are not authenticated. Please run `auth`.");
  }
}

export class CacheExpiredError extends Error {
  constructor() {
    super("Cached data has expired");
  }
}

export type IRacingAPIResponse = {
  // A link to the cached data
  link: string;
  // An ISO 8601 date string
  expires: string;
};

// Divisions are 0-based: 0 is Division 1, 10 is Rookie.
// See /data/constants/divisons for more information.
export type Division = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum CategoryId {
  Oval = 1,
  Road,
  DirtOval,
  DirtRoad,
}

export type CategoryIdValue = `${CategoryId}`;
export type CategoryIdKey = keyof typeof CategoryId;
export const CATEGORY_ID_LABELS = Object.keys(CategoryId);
export const CATEGORY_ID_VALUES = Object.values(CategoryId);

export enum ChartType {
  iRating = 1,
  TTRating,
  LicenseRating,
}

export type ChartTypeValue = `${ChartType}`;
export type ChartTypeKey = keyof typeof ChartType;
export const CHART_TYPE_LABELS = Object.keys(ChartType);

export enum EventType {
  Practice = 2,
  Qualify,
  TimeTrial,
  Race,
}

export type EventTypeValue = `${EventType}`;
export type EventTypeKey = keyof typeof EventType;
export const EVENT_TYPE_LABELS = Object.keys(EventType);

export enum Category {
  Road = "road",
  Oval = "oval",
  DirtRoad = "dirt_road",
  DirtOval = "dirt_oval",
  SportsCar = "sports_car",
  FormulaCar = "formula_car",
}

export type CategoryValue = `${Category}`;
export type CategoryKey = keyof typeof Category;
export const CATEGORY_LABELS: string[] = Object.keys(Category);
export const CATEGORY_VALUES: string[] = Object.values(Category);

export const isCategory = (value: string): value is CategoryValue =>
  CATEGORY_VALUES.includes(value as CategoryValue);

export const assertCategory = (
  value: string
): asserts value is CategoryValue => {
  if (!isCategory(value)) {
    throw new Error(`Invalid category: ${value}`);
  }
};
