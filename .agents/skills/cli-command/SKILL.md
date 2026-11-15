---
name: cli-command
description: Route iRacing CLI command work to the package-local api-command skill. Use for adding, modifying, or retiring API commands, flags, command groups, or command/service wiring in apps/iracing-data-cli.
---

# iRacing CLI command work

Read [root guidance](../../../AGENTS.md), then load the package-local
[api-command skill](../../../apps/iracing-data-cli/.agents/skills/api-command/SKILL.md).
If package-local skill discovery is unavailable, read that file and its linked
references directly. It owns implementation patterns, focused tests, command
change accountability, and the boundary for live input/output validation.

Do not maintain another command recipe or endpoint inventory here. Discover
current CLI scripts from its manifest; use the package-local skill as the single
implementation procedure.

For reconciliation with current upstream documentation, use the repository
[Data API compatibility-audit skill](../iracing-data-api-compatibility-audit/SKILL.md)
as coordinator. It owns docs retrieval/diff, evidence classification, canonical
repair order, regeneration, and the compatibility verdict. It delegates command
implementation to the package-local skill; generated clients remain transport,
not the subject of contract testing.

When changing these instructions, follow the
[agent regression procedure](../../../agent-regressions/README.md). Fixture
validation alone is not a model evaluation. Do not commit, push, or publish
unless requested.
