export enum Category {
  Road = "road",
  Oval = "oval",
  DirtRoad = "dirt_road",
  DirtOval = "dirt_oval",
  SportsCar = "sports_car",
  FormulaCar = "formula_car",
}

export type CategoryType = `${Category}`;
export const CATEGORY_LABELS: string[] = Object.keys(Category);
export const CATEGORY_VALUES: string[] = Object.values(Category);

export const isCategory = (value: string): value is CategoryType =>
  CATEGORY_VALUES.includes(value as CategoryType);

export const assertCategory = (
  value: string
): asserts value is CategoryType => {
  if (!isCategory(value)) {
    throw new Error(`Invalid category: ${value}`);
  }
};

export type IRacingAPIResponse = {
  // A link to the cached data
  link: string;
  // An ISO 8601 date string
  expires: string;
};
