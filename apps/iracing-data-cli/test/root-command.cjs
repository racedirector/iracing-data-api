exports.createRootCommand = async function () {
  const { createProgram } = await import("../dist/program.js");
  const program = createProgram({
    diagnostics: { info() {}, warn() {}, error() {} },
    fetch: globalThis.fetch,
  });
  program.commands.splice(0);
  return program;
};
