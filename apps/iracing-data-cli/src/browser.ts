import { spawn } from "node:child_process";

export async function openUrlInBrowser(url: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const command =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "cmd"
          : "xdg-open";

    const args =
      process.platform === "win32" ? ["/c", "start", "", url] : [url];

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
