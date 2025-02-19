import IRacingAPI from "@iracing-data/api";
import crypto from "node:crypto";
import fs from "node:fs";

// Compute the Base64‑encoded SHA‑256 hash of (password + email.toLowerCase()).
export async function hashPassword(email: string, password: string) {
  const value = password + email.toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("base64");
}

export function handleOutput(data: any, output?: string) {
  if (output) {
    fs.writeFileSync(output, JSON.stringify(data, null, 2));
    console.log("Output written to:", output);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
