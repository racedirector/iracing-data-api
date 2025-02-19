import crypto from "node:crypto";
import fs from "node:fs";

/**
 * Compute the Base64‑encoded SHA‑256 hash of (password + email.toLowerCase()).
 */
export async function hashPassword(email: string, password: string) {
  const value = password + email.toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("base64");
}

/**
 * Logs the data to the console or writes it to a file.
 * @param data The data to be output
 * @param output The path of the file to write the data to
 */
export function handleOutput(data: any, output?: string) {
  if (output) {
    fs.writeFileSync(output, JSON.stringify(data, null, 2));
    console.log("Output written to:", output);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
