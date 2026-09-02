# Contributing

The most useful contribution is a shipped URL.

## Add a ship (best first PR)

1. Install habitat-bunny in Cursor or Claude Code.
2. Run a sprint. Get a public URL. localhost does not count.
3. Copy the share block from `.habitat/ships.md`.
4. Open a PR that appends it to [SHIPS.md](./SHIPS.md).

That is the loop: people see real ships, they run a sprint, they add theirs.

## Skills

Skills live under `skills/`. The contract is in [AGENTS.md](./AGENTS.md). Short version:

- Promoted buckets are `sprint/` and `daily/`. Each promoted skill needs a `SKILL.md`, `agents/openai.yaml`, a docs page at `docs/<bucket>/<name>.md`, a line in the bucket README, a line in the top-level README, and the same path in `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `.grok-plugin/plugin.json`.
- User-invoked vs model-invoked: see [.agents/invocation.md](./.agents/invocation.md). Keep the frontmatter flag and the Codex `policy` in sync.
- If you add, rename, or reroute a user-reachable skill, update [ask-bunny](./skills/sprint/ask-bunny/SKILL.md).
- Install wording is copied from [.agents/install-block.md](./.agents/install-block.md). Do not invent a second command.
- Gate logic (vague ICP, skipped hop, localhost) stays in `src/`. Skills may describe a gate. They are not the only copy of a reject.

```bash
node scripts/check-skills.mjs   # must print SKILLS OK
```

## Code changes

```bash
npm install
npm run build
npm run smoke   # must print SMOKE OK
npm run check:skills
```

Keep the server complementary: it never writes the builder's code, never calls an LLM, never needs an API key. If a change requires a backend, it does not belong here.

Useful code PRs:

- clearer gate copy (still short, still bunny voice)
- better event-brief ingestion hints
- translations of the ritual prompts
- tests for a gate you found a way to sneak past

## Issues

Use the ship issue template if you want to show work in progress. Use a normal issue for bugs (include the `.habitat/sprint.md` hop and the tool that misfired, not secrets).
