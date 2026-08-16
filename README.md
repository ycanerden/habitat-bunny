# habitat-bunny

The Habitat bunny is a local MCP server that runs a timeboxed ship sprint inside the AI tool you already build with: Cursor, Claude Code, or Claude Desktop.

Your agent builds. The bunny does the one thing agents refuse to do: it keeps the clock honest, gates scope creep, grills your idea before you build it, and makes you actually ship.

Built by [Habitat](https://joinhabitat.eu), the community behind 200+ MVPs shipped in one night across 8 cities. This is that evening, as a tool.

## Why

AI removed the barrier to building, not to finishing. Agents are infinitely patient and infinitely agreeable, so they help you build forever: one more feature, one more refactor, never a URL anyone can click.

At Habitat nights we watched hundreds of people ship real MVPs in a single evening. The magic was never the advice. It was the container: a clock, a locked scope, and a moment where you have to show what you made. The bunny puts that container in your editor.

## Install

Requires Node 20+. No backend, no account, no API keys. Nothing leaves your machine.

### Cursor

One click:

[Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=habitat-bunny&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImhhYml0YXQtYnVubnkiXX0=)

Or add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

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

### Claude Code

```bash
claude mcp add habitat-bunny -- npx -y habitat-bunny
```

### Claude Desktop

Add to `claude_desktop_config.json` (Settings, Developer, Edit Config):

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

## How a sprint works

Say something like "let's do a ship sprint" and your agent calls `start_sprint`. The bunny asks one question first: solo, with a team, or at an event or hackathon?

Then four hops, one clock. Default window is one evening (4 hours), configurable.

1. **Lock the idea.** The bunny grills you (one question at a time, no compliments, no moving on from vague answers) until four gates pass: a specific problem, an ICP you could find 10 of this week, a one-liner a friend can repeat, and at least two things you are NOT building tonight. Then the idea locks. Nothing gets built before the lock.
2. **Build.** Your agent builds only the locked one-liner. Every new feature idea that comes up goes through the scope gate and lands in the backlog, not in the code. The bunny keeps announcing the clock.
3. **Ship.** A real URL a stranger can click. localhost does not count and the bunny will say so.
4. **Roast.** An honest read of what shipped against what was promised: idea, product, potential, one concrete fix for tomorrow, one validation move. Then the ship log, ready to share.

## Event and hackathon mode

At an event? Tell the bunny. Share whatever materials exist (the brief, theme, rules, submission requirements, deadline, judging criteria) in any form: pasted text, a link, a PDF. Your agent reads them and hands them over. From then on:

- the clock is the real submission deadline
- the idea grill checks fit against the event theme
- shipping checks the submission requirements
- the roast scores you against the actual judging criteria

Organizers: this means your whole event can run on a tool every participant installs in one line. Talk to us: ycanerden@gmail.com.

## The .habitat folder

All state lives in a `.habitat/` folder in your working directory, as human-readable files you own:

| File | What it holds |
| --- | --- |
| `sprint.md` | The current sprint: hops, deadlines, locked idea |
| `backlog.md` | Every parked feature idea, so nothing is lost, just postponed |
| `ships.md` | The ship log: everything that made it to a URL, with share templates |
| `event.md` | The event brief, in event mode |
| `state.json`, `history.json` | Machine state for the bunny |

Because it is just files, Cursor and Claude Code share the same sprint on the same machine.

## Tools

| Tool | What it does |
| --- | --- |
| `start_sprint` | Onboards (solo, team, event), starts the clock, opens the grill |
| `lock_idea` | Locks problem, ICP, one-liner, out-of-scope list; opens the build hop |
| `sprint_status` | Time left, current hop, pace verdict, the bunny's nudge |
| `check_scope` | Parks mid-sprint feature ideas in the backlog |
| `next_hop` | Closes the current hop, opens the next; refuses to skip gates |
| `ship` | Records the live URL and summary, writes the ship log |
| `roast` | Post-ship critique rubric (plus event judging criteria in event mode) |
| `ship_log` | Past ships, share template, streak fuel |

## Design principles

- **Complementary, not competitive.** The bunny never writes code and never answers build questions. It returns pacing, gates, and method; your own model does the thinking. The server never calls an LLM, so it costs nothing to run and needs no keys.
- **Local and yours.** Everything is markdown in your project folder. Delete `.habitat/` and the bunny forgets everything.
- **Shipped beats perfect.** The whole tool is opinionated toward one outcome: a URL that exists tonight.

## Habitat

Habitat runs one-night ship sprints for AI builders, with partners like Cursor and Lovable. 600+ people, 200+ MVPs, 8 cities, 4 countries.

- Events: [lu.ma/habitat](https://lu.ma/habitat)
- Web: [joinhabitat.eu](https://joinhabitat.eu)

MIT licensed. One hop at a time.
