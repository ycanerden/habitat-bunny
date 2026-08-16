# Contributing

The most useful contribution is a shipped URL.

## Add a ship (best first PR)

1. Install habitat-bunny in Cursor or Claude Code.
2. Run a sprint. Get a public URL. localhost does not count.
3. Copy the share block from `.habitat/ships.md`.
4. Open a PR that appends it to [SHIPS.md](./SHIPS.md).

That is the loop: people see real ships, they run a sprint, they add theirs.

## Code changes

```bash
npm install
npm run build
npm run smoke   # must print SMOKE OK
```

Keep the server complementary: it never writes the builder's code, never calls an LLM, never needs an API key. If a change requires a backend, it does not belong here.

Useful code PRs:

- clearer gate copy (still short, still bunny voice)
- better event-brief ingestion hints
- translations of the ritual prompts
- tests for a gate you found a way to sneak past

## Issues

Use the ship issue template if you want to show work in progress. Use a normal issue for bugs (include the `.habitat/sprint.md` hop and the tool that misfired, not secrets).
