---
name: ship
description: Record a live URL a stranger can click. Use when something is deployable, the builder says they shipped, or they offer localhost / a screenshot as the artifact.
---

# Ship

Shipped means a stranger can open a URL without the builder's laptop.

Read [CHECKLIST.md](CHECKLIST.md). Then record.

## Refuses

- Not a URL
- Not `http` or `https`
- `localhost`, `127.0.0.1`, or a `*.local` host

A rehearsal is not a ship. Deploy it (Vercel, Netlify, a share link, GitHub Pages), then come back.

## If the MCP is connected

Call `ship` with `url` and `summary` (what exists, not what was planned). If the tool rejects, relay the reject. Do not invent a pass.

## If the MCP is not connected

Append to `.habitat/ships.md`:

- date
- one-liner
- summary of what actually shipped
- public URL
- share block:

```
Shipped tonight: <one liner>
Live at: <url>
Built in one Habitat sprint.
```

Set current hop to roast.

## Event check

If `.habitat/event.md` exists, re-read it before you celebrate. Form submitted, repo linked, demo video, whatever the rules say. A great build that misses a requirement scores zero.
