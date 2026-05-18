#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const protoFiles = {
  telemetry: "./iracing-proto/telemetry.proto",
  broadcast: "./iracing-proto/broadcast.proto",
  schema: "./iracing-proto/schema.proto",
};

const outputDirs = {
  grpcWeb: "packages/telemetry/client/grpc-web/src/constants",
  grpcNode: "packages/telemetry/client/grpc-node/src/constants",
  telemetryTypes: "packages/telemetry/types/scripts/constants",
  jsonSchema: "packages/helpers/sync-telemetry-json-schema/src/constants",
};

const targetAliases = new Map([
  ["all", "all"],
  ["protoc", "all"],
  ["web", "web"],
  ["grpc-web", "web"],
  ["protoc-web", "web"],
  ["node", "node"],
  ["grpc-node", "node"],
  ["protoc-node", "node"],
  ["types", "types"],
  ["codegen", "types"],
  ["protoc-codegen", "types"],
  ["json-schema", "json-schema"],
  ["json", "json-schema"],
  ["protoc-json-schema", "json-schema"],
]);

const tasksByTarget = {
  all: ["types", "web", "node", "json-schema"],
  web: ["web"],
  node: ["node"],
  types: ["types"],
  "json-schema": ["json-schema"],
};

const help = () => {
  console.info(`Usage: node ./scripts/protoc.mjs [target]

Targets:
  all           Generate all protobuf outputs. This is the default.
  web           Generate gRPC-Web clients and protobuf JS files.
  node          Generate Node gRPC protobuf TypeScript and JS files.
  types         Generate schema protobuf TypeScript support for telemetry types.
  json-schema   Generate schema protobuf TypeScript support for the JSON schema sync helper.

Makefile-compatible aliases are also supported:
  protoc-web, protoc-node, protoc-codegen, protoc-json-schema
`);
};

const binPath = (name) => {
  const executable = process.platform === "win32" ? `${name}.cmd` : name;
  const candidate = path.join(rootDir, "node_modules", ".bin", executable);

  if (!existsSync(candidate)) {
    throw new Error(
      `Missing ${candidate}. Run pnpm install before generating protobuf files.`,
    );
  }

  return candidate;
};

const ensureOutputDir = (relativeDir) => {
  mkdirSync(path.join(rootDir, relativeDir, "iracing-proto"), {
    recursive: true,
  });
};

const runProtoc = (args) => {
  const command = process.env.PROTOC || "protoc";
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new Error(
        `Unable to find ${command}. Install protoc or set PROTOC to the protoc executable path.`,
      );
    }

    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const runWeb = () => {
  ensureOutputDir(outputDirs.grpcWeb);

  runProtoc([
    "-I=.",
    protoFiles.telemetry,
    protoFiles.broadcast,
    `--plugin=protoc-gen-grpc-web=${binPath("protoc-gen-grpc-web")}`,
    `--js_out=import_style=commonjs:${outputDirs.grpcWeb}`,
    `--grpc-web_out=import_style=typescript,mode=grpcwebtext:${outputDirs.grpcWeb}`,
  ]);
};

const runNode = () => {
  ensureOutputDir(outputDirs.grpcNode);

  runProtoc([
    "-I=.",
    protoFiles.telemetry,
    protoFiles.broadcast,
    `--plugin=protoc-gen-ts=${binPath("protoc-gen-ts")}`,
    "--ts_opt=unary_rpc_promise=true",
    "--ts_opt=target=node",
    `--ts_out=${outputDirs.grpcNode}`,
    `--js_out=import_style=commonjs:${outputDirs.grpcNode}`,
  ]);
};

const runTypes = () => {
  ensureOutputDir(outputDirs.telemetryTypes);

  runProtoc([
    `--plugin=protoc-gen-ts=${binPath("protoc-gen-ts")}`,
    "--ts_opt=unary_rpc_promise=true",
    "--ts_opt=target=node",
    `--ts_out=${outputDirs.telemetryTypes}`,
    protoFiles.schema,
  ]);
};

const runJsonSchema = () => {
  ensureOutputDir(outputDirs.jsonSchema);

  runProtoc([
    `--plugin=protoc-gen-ts=${binPath("protoc-gen-ts")}`,
    "--ts_opt=unary_rpc_promise=true",
    "--ts_opt=target=node",
    `--ts_out=${outputDirs.jsonSchema}`,
    protoFiles.schema,
  ]);
};

const runners = {
  web: runWeb,
  node: runNode,
  types: runTypes,
  "json-schema": runJsonSchema,
};

const main = () => {
  const requestedTarget = process.argv[2] ?? "all";

  if (requestedTarget === "--help" || requestedTarget === "-h") {
    help();
    return;
  }

  const target = targetAliases.get(requestedTarget);

  if (!target) {
    console.error(`Unknown protoc target: ${requestedTarget}`);
    help();
    process.exit(1);
  }

  for (const task of tasksByTarget[target]) {
    console.info(`Generating protobuf output: ${task}`);
    runners[task]();
  }
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
