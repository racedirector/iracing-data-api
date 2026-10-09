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
