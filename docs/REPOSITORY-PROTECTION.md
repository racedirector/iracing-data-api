# Repository protection and recovery

Inspect the live [main ruleset](https://github.com/racedirector/iracing-data-api/rules/3770622) and [release-tag ruleset](https://github.com/racedirector/iracing-data-api/rules/24421863) for current selectors, required checks and bypass actors. [CI](../.github/workflows/ci.yml) owns verification execution; [the release workflow](../.github/workflows/release.yml) owns release triggers. Live GitHub configuration is authoritative for enforcement.

Both rulesets retain an explicit organization administrator bypass (`OrganizationAdmin`, `always`). Routine changes should use a PR with a passing `Verify` result. Bypass is reserved for a documented incident, such as repairing a verification workflow that cannot validate its own repair or correcting a mistaken release tag. Record the reason, affected commit/tag, validation performed, and recovery outcome in the issue or PR. Do not disable a ruleset or remove the required check as a routine workaround.

For a broken check, inspect the Actions logs, fix the owning source or workflow in a focused PR, and rerun `pnpm verify` and CI. If the check itself makes merging the repair impossible, an organization administrator may use the existing bypass for that repair after reviewing available validation. Then rerun CI and confirm `Verify` remains required and reports from GitHub Actions. Preserve linear history and avoid force-pushing main.

For a mistaken release tag, first inspect the tagged commit, release run, GitHub Release, and npm publication state. A published version should normally receive a new corrective version/tag: moving a tag does not undo registry publication and can retrigger publishing. If an unpublished mistaken tag must be removed or corrected, an organization administrator may bypass the tag rule for that exact ref after recording the reason and coordinating recovery. Follow [releasing](RELEASING.md); do not casually rewrite a published release.

Read back the live configuration after recovery or an intentional policy edit:

```bash
gh api repos/racedirector/iracing-data-api/rulesets/3770622
gh api repos/racedirector/iracing-data-api/rules/branches/main
gh api repos/racedirector/iracing-data-api/rulesets/24421863
```

Confirm both rulesets remain active, selectors and bypass actors are unchanged, main still requires only the canonical `Verify` check, and release tags still restrict updates/deletion. These commands inspect configured enforcement; they do not exercise a destructive push against real release history.
