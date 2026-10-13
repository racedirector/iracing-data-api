# Add a CLI command

Replace the bracketed fields and remove optional fields that do not apply:

```text
Use $iracing-data-cli-add-command to implement
`iracing-data [command path]` in apps/iracing-data-cli.

Behavior: [What it does and what successful output contains.]
Inputs: [Arguments/options, defaults, and validation.]
Operation: [Known client operation, or behavior to trace in the checkout.]
Authentication: [Required access/scope, or none.]
Output: [stdout format; file output if requested.]
Acceptance criteria: [Observable success and failure cases.]

Implement command.ts, scope.ts, and index.ts following the closest existing
command. Register it in the hierarchy, reuse the relevant shared helpers,
add offline tests, update usage documentation, and run applicable checks.
Report the resulting invocation and validation results.
```
