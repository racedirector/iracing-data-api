import IRacingAPI from "@iracing-data/api";

export const leagueMembership = (api: IRacingAPI) => async (custId: number) => {
  const leagueMembership = await api.getLeagueMembership(custId);
  console.log(leagueMembership);
};

export default leagueMembership;
