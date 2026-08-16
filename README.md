# habitat-bunny

[![npm](https://img.shields.io/npm/v/habitat-bunny)](https://www.npmjs.com/package/habitat-bunny)
[![license](https://img.shields.io/github/license/ycanerden/habitat-bunny)](./LICENSE)
[![habitat.md](https://img.shields.io/badge/habitat.md-always%20one%20hop%20ahead-5CAE30)](https://habitat.md)

The Habitat bunny, every day you build. Not only on event night.

Your agent writes the code. The bunny is the daily ship layer: it names today's one hop, parks everything else, and will not call it shipped until a stranger can click a URL.

No backend. No account. No API keys. Nothing leaves your machine.

**Install in Cursor (one click):**
[Add habitat-bunny](cursor://anysphere.cursor-deeplink/mcp/install?name=habitat-bunny&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImhhYml0YXQtYnVubnkiXX0=)

```bash
# Claude Code
claude mcp add habitat-bunny -- npx -y habitat-bunny
```

Then say: `what's today's hop`.

Built by [Habitat](https://habitat.md): 600+ people, 200+ MVPs, 8 cities, 4 countries. Hover the bunny on the site. It walks.

## Why this exists

AI removed the barrier to building, not to finishing. Agents are infinitely patient and infinitely agreeable, so they help you build forever: one more feature, one more refactor, never a URL anyone can click.

Search MCPs get used every session because they are a primitive: you need a fact, you search. Habitat-bunny is the same shape, for finishing. You need to stay honest about what goes live today, you call `today`.

The 4-hour Habitat night is still here (`start_sprint`). Daily hops are the default.

## Daily (the default)

One hop per calendar day. No ceremony.

1. **Name it.** `today` locks one sentence: a visible outcome a stranger can click before the day ends. "Work on the app" will not lock.
2. **Build only that.** Side quests go through `check_scope` and land in `.habitat/backlog.md`. The backlog survives across days.
3. **Ship.** A public URL. localhost does not count. A public PR counts.
4. **Roast (optional).** Honest read of what shipped vs what you promised this morning.

Call `today` at the start of a building session, the way you would call a search tool when you need the web.

## Event and hackathon nights

When you want the original Habitat evening (lock, build, ship, roast on one shared clock), say `let's do a ship sprint` or call `start_sprint`.

Organizers: paste the brief, theme, rules, deadline, judging criteria. From then on the clock is the real submission deadline and the roast uses the actual criteria.

Talk to us: ycanerden@gmail.com

## Why not a system prompt

A prompt is a suggestion. The bunny is a gate.

- Vague daily intent? `today` rejects it. You cannot start building.
- Vague ICP on a night? `lock_idea` rejects it.
- New feature mid-day? `check_scope` parks it in `.habitat/backlog.md`. It is not forgotten, it is not today.
- `localhost:3000`? `ship` refuses. Deploy it.
- Want to skip to roast on a night? `next_hop` will not skip a hop.

A prompt cannot hold state across Cursor and Claude Code. The bunny can: it is just files in `.habitat/`.

## Install (manual)

Requires Node 20+.

Cursor / Claude Desktop, in `mcp.json`:

```json
{
  "mcpServers": {
    "habitat-bunny": {
      "command": "npx",
      "args": ["-y", "habitat-bunny"]
    }
  }
}
```

## The .habitat folder

| File | What it holds |
| --- | --- |
| `today.md` | Today's hop: intent, out of scope, ship |
| `burrow.json` | Daily state + the persistent backlog |
| `sprint.md` | Current night sprint, if you started one |
| `backlog.md` | Parked feature ideas (survives across days) |
| `ships.md` | Everything that made it to a URL, with a share template |
| `event.md` | Event brief, in event mode |
| `state.json`, `history.json` | Machine state |

Delete the folder and the bunny forgets everything.

## Tools

`today` · `check_scope` · `ship` · `roast` · `ship_log` · `start_sprint` · `lock_idea` · `sprint_status` · `next_hop`

## Add your ship

The share object is the ship log, not a star. Run a hop, then open a PR that appends your log to [SHIPS.md](./SHIPS.md). That is how this repo stays useful: a public wall of things that actually shipped.

Template lives in the ship log the bunny writes for you:

```
Shipped today: <one liner>
Live at: <url>
One hop. Habitat bunny.
```

## Habitat

- Site: [habitat.md](https://habitat.md)
- Events: [lu.ma/habitat](https://lu.ma/habitat)
- npm: [habitat-bunny](https://www.npmjs.com/package/habitat-bunny)

MIT. One hop at a time.
