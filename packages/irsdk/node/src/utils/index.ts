import { getSimStatus } from "./sim-status";

export const isSimRunning = async () => {
  try {
    return await getSimStatus();
  } catch {
    return false;
  }
};

export { getSimStatus };
export default getSimStatus;
