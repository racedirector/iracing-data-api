import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);

/**
 * Opens an authorization URL with the host browser, rejecting failed handoffs.
 * @param {URL} url - Authorization URL to open without shell interpolation.
 * @returns {Promise<void>} Completion of the host handoff; Linux does not wait for the opener to exit.
 */
export async function openUrlInBrowser(url: URL): Promise<void> {
  if (process.platform === "darwin") {
    await execute("open", [url.href]);
  } else if (process.platform === "win32") {
    await execute("rundll32", ["url.dll,FileProtocolHandler", url.href]);
  } else {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("xdg-open", [url.href], {
        detached: true,
        stdio: "ignore",
      });

      child.once("error", reject);
      child.once("spawn", () => {
        child.unref();
        resolve();
      });
    });
  }
}
