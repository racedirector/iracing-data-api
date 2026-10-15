import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import * as ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");

test("generated fetch transport types work in Node and browser projects", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "fetch-runtime-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const runtime = path.join(directory, "runtime.ts");
  fs.writeFileSync(
    runtime,
    "export type FetchAPI = WindowOrWorkerGlobalScope['fetch'];\nexport const transport: FetchAPI = fetch;\n",
  );
  const normalize = () =>
    execFileSync(process.execPath, [
      path.join(root, "scripts/normalize-fetch-runtime.mjs"),
      runtime,
    ]);
  normalize();
  const normalized = fs.readFileSync(runtime, "utf8");
  normalize();
  assert.equal(fs.readFileSync(runtime, "utf8"), normalized);

  for (const host of [
    { lib: ["lib.es2022.d.ts"], types: ["node"] },
    { lib: ["lib.es2022.d.ts", "lib.dom.d.ts"], types: [] },
  ]) {
    const program = ts.createProgram([runtime], {
      ...host,
      strict: true,
      noEmit: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      typeRoots: [path.join(root, "node_modules/@types")],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.deepEqual(
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      ),
      [],
    );
  }
});
