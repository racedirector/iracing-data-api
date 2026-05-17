#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Common directories
const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const buildDir = path.join(rootDir, "build");

// Platform helpers
const platform = process.platform;
const isWindows = platform === "win32";
const isMacOS = platform === "darwin";

// Arch constant
const arch = process.arch;

// Paths
const nodePath = process.env.SEA_NODE_PATH || process.execPath;
const seaConfigPath = path.join(rootDir, "sea-config.json");
const blobPath = path.join(buildDir, "sea-prep.blob");
const packageName = "driver-lookup";

const outputDir = path.join(
  rootDir,
  "dist",
  `${packageName}-${platform}-${arch}`,
);
const outputName = platform === "win32" ? `${packageName}.exe` : packageName;
const outputPath = path.join(outputDir, outputName);

console.log(`📦 Building ${packageName} SEA...\n`);

console.log("1. Generating SEA blob...");
execSync(`node --experimental-sea-config "${seaConfigPath}"`, {
  stdio: "inherit",
  cwd: rootDir,
});

console.log(`2. Using Node.js from: ${nodePath}`);

console.log("3. Copying Node.js binary...");
fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(nodePath, outputPath);

console.log("4. Removing codesigning (skipped)...");

// let removeSigningCmd = null;
// if (isMacOS) {
//   removeSigningCmd = ["codesign", "--remove-signature", outputPath];
// }

// if (isWindows) {
//   removeSigningCmd = ["signtool", "remove", "/s", outputPath];
// }

// if (removeSigningCmd) {
//   execSync(removeSigningCmd.join(" "), {
//     stdio: "inherit",
//     cwd: rootDir,
//   });
// }

console.log("5. Injecting SEA blob...");
const postjectCmd = [
  "npx --yes postject",
  `"${outputPath}"`,
  "NODE_SEA_BLOB",
  `"${blobPath}"`,
  "--sentinel-fuse",
  "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  isMacOS ? "--macho-segment-name NODE_SEA" : "",
].join(" ");

execSync(postjectCmd, { stdio: "inherit", cwd: rootDir });

console.log("6. Codesigning (skipped)...");

// let codeSigningCmd = null;
// if (isMacOS) {
//   codeSigningCmd = ["codesign", "--sign", "-", outputPath];
// }

// if (isWindows) {
//   codeSigningCmd = ["signtool", "sign", "/fd", "SHA256", outputPath];
// }

// if (codeSigningCmd) {
//   execSync(codeSigningCmd.join(" "), {
//     stdio: "inherit",
//     cwd: rootDir,
//   });
// }

console.log(`\n✅ SEA executable created: ${outputPath}`);
