# ADR 0001: Skills sit beside the MCP

## Status

Accepted.

## Decision

habitat-bunny ships two complementary surfaces from one repo:

1. **Skills** under `skills/`. The method: how to grill, lock, park, ship, roast.
2. **MCP server** under `src/`. The gate: tools that refuse a vague ICP, a skipped hop, a localhost URL.

A prompt is a suggestion. The bunny is a gate. Skills without the MCP still run the ritual. The MCP without skills still holds state. Together, the host model has the method *and* a tool that will say no.

## Consequences

- The Claude Code plugin and the `npx skills` installer ship the promoted skills. They do not replace `npx habitat-bunny`.
- Plugin vs `npx skills` are exclusive (two copies of every skill). The MCP is not exclusive with either.
- Gate logic stays in `src/`. Skills may describe a gate and, if the MCP is missing, enforce it in prose and write `.habitat/`. They must not become the only copy of a reject rule.
- `setup-habitat` writes the burrow. The MCP reads the same burrow. One folder, two clients.
