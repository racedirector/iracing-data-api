export const sleepMs = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const sleep = (seconds: number) => sleepMs(seconds * 1000);
