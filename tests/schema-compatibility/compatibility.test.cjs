const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { test } = require("node:test");
const ts = require("typescript");
const baseline = require("./exports.json");
const root = path.resolve(__dirname, "../..");
test("every built alias retains identity and replacement-specific declaration documentation", () => {
  for (const entry of baseline) {
    const module = entry.module.replace("/src/", "/dist/").replace(/\.ts$/, "");
    const declaration = fs.readFileSync(
      path.join(root, module + ".d.ts"),
      "utf8",
    );
    assert.ok(
      declaration.includes(
        `/** @deprecated Use ${entry.new} instead. */\nexport declare const ${entry.old}`,
      ) ||
        declaration.includes(
          `/** @deprecated Use ${entry.new} instead. */\nexport type ${entry.old}`,
        ),
      entry.old,
    );
    const source = ts.createSourceFile(
      module,
      declaration,
      ts.ScriptTarget.Latest,
      true,
    );
    const canonical = source.statements.find(
      (statement) =>
        statement.name?.text === entry.new ||
        statement.declarationList?.declarations.some(
          (item) => item.name.text === entry.new,
        ),
    );
    assert.ok(canonical, entry.new);
    assert.ok(
      !canonical.getFullText(source).includes("@deprecated"),
      entry.new,
    );
    if (entry.kind === "const") {
      const surface = entry.module.includes("/oauth/") ? "oauth" : "api";
      const exports = require(path.join(root, `packages/${surface}/schema`));
      assert.equal(exports[entry.old], exports[entry.new], entry.old);
      assert.equal(
        require(path.join(root, module))[entry.old],
        exports[entry.new],
      );
      if (surface === "oauth")
        assert.equal(
          require(path.join(root, "packages/oauth/client"))[entry.old],
          exports[entry.new],
        );
    }
  }
  assert.match(
    fs.readFileSync(
      path.join(root, "packages/oauth/client/dist/index.d.ts"),
      "utf8",
    ),
    /export \* from "@iracing-data\/oauth-schema"/,
  );
});
test("historical and canonical types, literals, brands and codec inputs/outputs are equivalent", () => {
  const fixture = fs.readFileSync(path.join(__dirname, "types.ts"), "utf8");
  for (const entry of baseline) {
    assert.ok(
      fixture.includes(`.${entry.old}`),
      `Missing type assertion: ${entry.old}`,
    );
    assert.ok(
      fixture.includes(`.${entry.new}`),
      `Missing canonical type assertion: ${entry.new}`,
    );
  }
  const program = ts.createProgram([path.join(__dirname, "types.ts")], {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (name) => name,
      getNewLine: () => "\n",
    }),
  );
});
test("authored implementations use canonical schema symbols", () => {
  const names = new Set(baseline.map((entry) => entry.old));
  const files = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  })
    .trim()
    .split("\n");
  for (const file of files) {
    if (
      !/^(packages|examples)\/.*\.(ts|md)$/.test(file) ||
      /\/client\/(fetch|axios)\//.test(file) ||
      file.endsWith("AGENTS.md")
    )
      continue;
    const content = fs
      .readFileSync(path.join(root, file), "utf8")
      .split("// Historical exports stay")[0];
    for (const symbol of content.match(/\bIRacing\w+\b/g) || [])
      assert.ok(!names.has(symbol), `${file}: ${symbol}`);
  }
});
