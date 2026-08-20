## What it does

`setup-habitat` writes the burrow: a `.habitat/` folder the other skills (and the MCP) read and write.

The defining constraint: it is run-once configuration. It does not start a clock and it will not restart a sprint that is already live.

## When to reach for it

You invoke this by typing `/setup-habitat`, and the agent won't reach for it on its own.

Reach for it the first time this repo meets Habitat. If the folder already exists and a sprint is live, stop.

## Prerequisites

None. This *is* the prerequisite for the rest.

## The burrow, not a product

Three markdown files are enough: `sprint.md`, `backlog.md`, `ships.md`. Event mode adds `event.md`. The MCP may add `state.json`. Do not invent a fourth system of record.

## Common questions

**Do I commit `.habitat/`?**
Usually no. It is local state, like a scratchpad. `ships.md` is the one file you might copy from when you add a row to the public [SHIPS.md](../../SHIPS.md).

**Skills or MCP first?**
Skills first (the method). Add the MCP when you want a tool that can say no.

## It's working if

- `.habitat/` exists and you know which file is the clock.
- A second setup run refuses to clobber a live sprint.

## Where it fits

Run-once setup. Every other user-invoked skill assumes it. The map is [ask-bunny](./ask-bunny.md).
