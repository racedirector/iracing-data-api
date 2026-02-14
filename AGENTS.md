# Agent Guidance

This file applies to the entire repository. Add more specific AGENTS.md files in subdirectories if future work needs additional rules.

## Purpose
- Treat this document as the shared operating guide for both human developers and coding agents.
- Keep changes scoped, reversible, and easy to review.
- Prefer consistency with existing workspace patterns over introducing new tooling conventions.

## Workflow
- Use **pnpm** for all scripts and installs (see `packageManager` in `package.json`).
- When running scripts on a single package, prefer `pnpm --filter <name> <script>` to avoid rebuilding unrelated workspaces.
- Code generation commands are namespaced in `package.json` (for example `pnpm codegen`, `pnpm codegen:openapi`). Run only what you need to keep generated files in sync.
- For scoped changes, run the narrowest command that validates your edits before running full-repo checks.

## Code Style
- Follow the existing ESLint/Prettier configuration. If you touch JavaScript/TypeScript files, run `pnpm lint` and `pnpm style` (or `pnpm format` to auto-fix) before committing.
- TypeScript lives across multiple packages; keep shared types in the relevant `packages/*` locations rather than duplicating them.
- Do **not** wrap imports in `try/catch` blocks.
- Match naming and file structure already used by the nearest package.

## Testing and Checks
- Use `pnpm test --filter <package>` or package-specific scripts when applicable. If no tests exist for your change, run the most relevant lint/format commands.
- For apps or generated clients, consider running `pnpm build --filter <package>` to ensure type safety.
- When changes affect generated output, run only the corresponding codegen task(s) and verify affected packages build.

## Documentation
- Update the closest README when you change behavior or add commands. Keep instructions concise and prefer linking to package-level READMEs.
- For new automation or maintenance workflows, add a short “how to run” note near the package that owns the workflow.

## Repository Hygiene
- Avoid committing generated artifacts unless your change requires regenerating them. If regeneration is necessary, include the exact script you ran in your commit message or PR description.
- This is a monorepo; be mindful of cross-package dependencies and update versioned references consistently.
- Keep PRs focused: separate refactors from behavior changes whenever practical.

## Definitions
- **Workspace root**: the repository top-level directory containing `package.json` and the pnpm workspace configuration.
- **Package**: any workspace member under `apps/*` or `packages/*` (including nested client packages).
- **Scoped command**: a pnpm command run with `--filter` to target one package or a small subset.
- **Codegen**: scripts under `codegen*` in `package.json` that produce OpenAPI specs or generated clients.
- **Generated artifacts**: files produced by generators (OpenAPI output, client SDK files, protocol-derived files) rather than hand-authored source.
- **Behavior change**: any change that alters runtime behavior, public interfaces, generated API shape, or developer workflows.
- **Mechanical change**: formatting, file moves, renames, or non-functional refactors with no behavior impact.

## Pull Request Expectations
- Summarize **what** changed, **why** it changed, and **how** you validated it.
- Call out any generated files and include the exact commands used to regenerate them.
- If checks were skipped due to environment limits, explicitly mention what was skipped and why.
