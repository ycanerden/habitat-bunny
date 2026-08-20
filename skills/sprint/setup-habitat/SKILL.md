---
name: setup-habitat
description: Write the .habitat burrow and set how this repo sprints.
disable-model-invocation: true
---

# Setup Habitat

Run once per repo. After this, the other skills have a place to write.

## Ask, one question at a time

1. Default sprint length (hours). Offer 4 (one evening). Accept a number between 0.5 and 72.
2. Will they ever run event / hackathon mode from this repo? If yes, create `.habitat/event.md` as a stub.
3. Are they installing the MCP gate (`npx habitat-bunny`) as well, or skills only?

Do not ask anything you can see. If `.habitat/` already exists and has a sprint, say so and stop. Do not restart their clock.

## Write the burrow

Create `.habitat/` if missing:

- `sprint.md` — empty template: id, mode, current hop, clock
- `backlog.md` — `# Parked` and one line: "Ideas that showed up mid-sprint. Not tonight."
- `ships.md` — `# Ships` and one line: "URLs a stranger can click."

Read [BURROW.md](BURROW.md) for the file contract. Do not invent extra files.

## Close

Tell them:

- Type `/start-sprint` for an evening.
- Type `/today` if they are already mid-build and lost.
- Type `/ask-bunny` if they do not know which.

If they want the gate, give the MCP install from the repo README. Do not paste a second invented command.
