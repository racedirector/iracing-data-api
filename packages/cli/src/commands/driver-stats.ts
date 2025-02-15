import IRacingAPI from "@iracing-data/api";

export const driverStats = (api: IRacingAPI) => async (category) => {
  const driverStats = await api.getDriverStatsByCategory(category);
  console.log(driverStats);
};

export default driverStats;
