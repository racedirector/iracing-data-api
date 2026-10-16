/**
 * Platform browser-launch adapter for the authorization URL.
 *
 * Choose the host opener and detach after spawn so browser lifetime does not hold
 * CLI completion. Successful spawn does not prove the page opened or authorization
 * succeeded; authenticate.ts owns fallback/manual instructions and callback outcome.
 * The URL carries authorization state, not issued tokens. Never use this helper as
 * an arbitrary command or token-output channel.
 */
import { spawn } from "node:child_process";

/**
 * Selects the platform-native URL opener without spawning it, keeping platform policy
 * independently testable.
 * @param {NodeJS.Platform} platform - Host platform used to select the browser-launch executable.
 * @param {string} url - Absolute URL used by this operation.
 * @returns {{ command: string; args: string[]; }} Platform-specific executable and argument list for opening the URL.
 */
export function browserLaunchCommand(platform: NodeJS.Platform, url: string) {
  if (platform === "darwin") {
    return { command: "open", args: [url] };
  }

  if (platform === "win32") {
    return {
      command: "rundll32",
      args: ["url.dll,FileProtocolHandler", url],
    };
  }

  return { command: "xdg-open", args: [url] };
}

/**
 * Starts the platform URL opener detached from the CLI; spawn success only means the browser
 * handoff was accepted, not that OAuth completed.
 * @param {string} url - Absolute URL used by this operation.
 * @returns {Promise<void>} Completion after the browser process has been launched.
 */
export async function openUrlInBrowser(url: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const { command, args } = browserLaunchCommand(process.platform, url);

    const child = spawn(command, args, {
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
