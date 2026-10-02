# Runtime repository discovery for compatibility audits

This is a discovery procedure, not a saved package/file inventory. Apply it to both Data API and OAuth audits. Resolve paths from the repository root; if a named policy/tool is missing or changed, inspect current guidance and report the gap rather than trusting an old map.

1. Inspect `git status --short`, the current revision, and root `AGENTS.md`. Discover scoped instructions with `rg --files --hidden -g AGENTS.md -g '!node_modules' -g '!target' -g '!dist'`. Read guidance applicable to every surface examined.
2. Read `workspace-policy.json`, `pnpm-workspace.yaml`, root `Cargo.toml`, `dist-workspace.toml`, and current package/Cargo manifests. Run `pnpm check:topology` to validate policy against discovered membership; a failure is an inventory limit to report. Read manifest names, versions, exports, dependencies, scripts and publication flags rather than copying a package list. Read release guidance and generation ownership from canonical guides.
3. Use `loadWorkspaces` from `scripts/workspace-impact.mjs` for the current policy/manifests/dependency and managed-release inventory:

   ```bash
   node --input-type=module -e 'import {loadWorkspaces,root} from "./scripts/workspace-impact.mjs"; console.info(JSON.stringify(loadWorkspaces(root), null, 2))'
   ```

   Treat this as deterministic inventory, not proof of semantic ownership or support. Discover source files/exports/tests in each policy path relevant to the audit. Inspect current source imports and runtime calls; manifest dependencies alone do not express generation edges. Follow generated surfaces back through root/scoped guidance to authored inputs. Private helpers/router and independently versioned public packages have different release implications.

4. Search within discovered paths for the requested wire names and behavior. Start with these terms but expand as evidence requires: Data API `parameters`, `required`, `nullable`, `coerce`, `URLSearchParams`, `Authorization`, `link`, `chunk`, `cache`, `operationId`, response/status/security mappings; OAuth `authorize`, `token`, `refresh`, `PKCE`, `mask`, `scope`, `session`, `revoke`, `profile`, `JWT`, errors and rate limits. Inspect exact exports, declarations and calls rather than treating filename matches as implementation.
5. Locate tests/fixtures/specs and package scripts dynamically. Read assertions and mocked boundaries before claiming coverage. A test dependency, a successful build, or an endpoint name in generated docs does not prove runtime behavior. Discover examples and source consumers from manifests/imports. Read git history only to establish intent/provenance, not to override current source.
6. For proposed authored paths, call the current `analyzeImpact` export with the discovered paths and workspace inventory to derive downstream test/release context. For an actual branch diff, use the documented `pnpm impact --base <ref> --json` command after checking its current usage. For example:

   ```bash
   node --input-type=module -e 'import {analyzeImpact,loadWorkspaces,root} from "./scripts/workspace-impact.mjs"; console.info(JSON.stringify(analyzeImpact(["<discovered-authored-path>"],loadWorkspaces(root)), null, 2))'
   ```

   Verify semantic generation edges against canonical guidance and current scripts. Do not treat the tool's suggested release order as authorization to bump versions or release.

Rebuild the inventory even when a previous audit report includes paths or packages. If an old path is absent, rediscover by policy role, exports, symbols and ownership. Report coverage gaps explicitly; never silently narrow the audit to surviving search seeds.
