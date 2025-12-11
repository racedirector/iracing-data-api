# Agent Guidance

This file applies to the entire repository. Add more specific AGENTS.md files in subdirectories if future work needs additional rules.

## Workflow
- Use **pnpm** for all scripts and installs (see `packageManager` in `package.json`).
- When running scripts on a single package, prefer `pnpm --filter <name> <script>` to avoid rebuilding unrelated workspaces.
- Code generation commands are namespaced in `package.json` (for example `pnpm codegen`, `pnpm codegen:openapi`). Run only what you need to keep generated files in sync.

## Code Style
- Follow the existing ESLint/Prettier configuration. If you touch JavaScript/TypeScript files, run `pnpm lint` and `pnpm style` (or `pnpm format` to auto-fix) before committing.
- TypeScript lives across multiple packages; keep shared types in the relevant `packages/*` locations rather than duplicating them.
- Do **not** wrap imports in `try/catch` blocks.

## Testing and Checks
- Use `pnpm test --filter <package>` or package-specific scripts when applicable. If no tests exist for your change, run the most relevant lint/format commands.
- For apps or generated clients, consider running `pnpm build --filter <package>` to ensure type safety.

## Documentation
- Update the closest README when you change behavior or add commands. Keep instructions concise and prefer linking to package-level READMEs.

## Repository Hygiene
- Avoid committing generated artifacts unless your change requires regenerating them. If regeneration is necessary, include the exact script you ran in your commit message or PR description.
- This is a monorepo; be mindful of cross-package dependencies and update versioned references consistently.
