# habitat-bunny

[![npm](https://img.shields.io/npm/v/habitat-bunny)](https://www.npmjs.com/package/habitat-bunny)
[![license](https://img.shields.io/github/license/ycanerden/habitat-bunny)](./LICENSE)
[![habitat.md](https://img.shields.io/badge/habitat.md-always%20one%20hop%20ahead-5CAE30)](https://habitat.md)
[![skills.sh](https://skills.sh/b/ycanerden/habitat-bunny)](https://skills.sh/ycanerden/habitat-bunny)

The Habitat night, inside the editor you already build with.

Your agent writes the code. The bunny does the one thing agents refuse to do: it keeps the clock honest, gates scope creep, grills your idea before you build it, and will not call it shipped until a stranger can click a URL.

No backend. No account. No API keys. Nothing leaves your machine.

Two complementary pieces. **Skills** are the method (the grill, the hops, the roast). The **MCP** is the gate (it will refuse a vague ICP, a skipped hop, a localhost URL). Install skills first. Add the MCP if you want the no to be a tool, not a suggestion.

The two skill routes are exclusive. The plugin is a managed bundle. skills.sh writes files you own and edit. Installing both leaves every skill twice: pick one. The MCP can sit next to either.

### 1. Get the skills

<details>
<summary><strong>Claude Code</strong></summary>

```bash
/plugin marketplace add ycanerden/habitat-bunny
/plugin install habitat-bunny
```

</details>

<details>
<summary><strong>Codex, Cursor, and other agents</strong></summary>

```bash
npx skills@latest add ycanerden/habitat-bunny
```

Pick the skills you want, and which coding agents to install them on. **The installer lets you choose which skills to take, so make sure `setup-habitat` is one of them.**

</details>

### 2. Run `/setup-habitat`

Once per repo. It writes the burrow (`.habitat/`) and asks how you sprint.

### 3. Optional: the MCP gate

**Install in Cursor (one click):**
[Add habitat-bunny](cursor://anysphere.cursor-deeplink/mcp/install?name=habitat-bunny&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImhhYml0YXQtYnVubnkiXX0=)

```bash
# Claude Code
claude mcp add habitat-bunny -- npx -y habitat-bunny
```

Then say: `let's do a ship sprint`. Or type `/today` if you are already mid-build and lost.

Built by [Habitat](https://habitat.md): 600+ people, 200+ MVPs, 8 cities, 4 countries. Hover the bunny on the site. It walks.

## Why this exists

AI removed the barrier to building, not to finishing. Agents are infinitely patient and infinitely agreeable, so they help you build forever: one more feature, one more refactor, never a URL anyone can click.

At Habitat nights the magic was never the advice. It was the container: a clock, a locked scope, and a room waiting to see what you made. This package is that container.

## Why not a system prompt

A prompt is a suggestion. The bunny is a gate.

- Vague ICP? `lock_idea` rejects it. You cannot start building.
- New feature mid-sprint? `check_scope` parks it in `.habitat/backlog.md`. It is not forgotten, it is not tonight.
- `localhost:3000`? `ship` refuses. Deploy it.
- Want to skip to roast? `next_hop` will not skip a hop.

A prompt cannot hold state across Cursor and Claude Code. The bunny can: it is just files in `.habitat/`.

## How a sprint works

Four hops, one clock. Default window is one evening (4 hours).

1. **Lock the idea.** One question at a time, no compliments. Four gates: a specific problem, an ICP you could find 10 of this week, a one-liner a friend can repeat, at least two things you are NOT building tonight.
2. **Build.** Only the locked one-liner. Side quests go to the backlog. The clock keeps talking.
3. **Ship.** A live URL. localhost does not count.
4. **Roast.** Honest read of what shipped vs what was promised, then a ship log ready to paste.

## Event and hackathon mode

Organizers: your whole event can run on a tool every participant installs in one line.

Tell the bunny you are at an event. Paste the brief, theme, rules, deadline, judging criteria. From then on:

- the clock is the real submission deadline
- the grill checks fit against the theme
- shipping checks the submission requirements
- the roast scores against the actual judging criteria

Talk to us: ycanerden@gmail.com

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
| `sprint.md` | Current sprint: hops, deadlines, locked idea |
| `backlog.md` | Parked feature ideas |
| `ships.md` | Everything that made it to a URL, with a share template |
| `event.md` | Event brief, in event mode |
| `state.json`, `history.json` | Machine state |

Delete the folder and the bunny forgets everything.

## Tools

`start_sprint` · `lock_idea` · `sprint_status` · `check_scope` · `next_hop` · `ship` · `roast` · `ship_log`

## Reference

These split on one axis: who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/start-sprint`). **Model-invoked** skills can be invoked by you or reached for automatically when the task fits. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

Unsure which hop? Type `/ask-bunny`.

### Sprint

The Habitat night ritual.

**User-invoked**

- **[ask-bunny](./skills/sprint/ask-bunny/SKILL.md)**: Ask which skill or flow fits. A router over the skills in this repo.
- **[start-sprint](./skills/sprint/start-sprint/SKILL.md)**: Run a timeboxed ship sprint: lock, build, ship, roast.
- **[setup-habitat](./skills/sprint/setup-habitat/SKILL.md)**: Write the burrow and set how this repo sprints. Run once per repo.

**Model-invoked**

- **[grilling](./skills/sprint/grilling/SKILL.md)**: One question at a time, no compliments, until the four lock gates pass.
- **[check-scope](./skills/sprint/check-scope/SKILL.md)**: Park a mid-sprint feature idea in the backlog. It is not forgotten. It is not tonight.
- **[ship](./skills/sprint/ship/SKILL.md)**: Record a live URL a stranger can click. localhost does not count.
- **[roast](./skills/sprint/roast/SKILL.md)**: Honest read of what shipped vs what was promised, then one next validation move.

### Daily

One hop today.

**User-invoked**

- **[today](./skills/daily/today/SKILL.md)**: Lock one sentence for today and take it to a URL before you stop.

**Model-invoked**

- **[pace](./skills/daily/pace/SKILL.md)**: Read the clock and nudge the current hop. Reach when the conversation drifts or the builder goes quiet.

## Add your ship

The share object is the ship log, not a star. Run a sprint, then open a PR that appends your log to [SHIPS.md](./SHIPS.md). That is how this repo stays useful: a public wall of things that actually shipped tonight.

Template lives in the ship log the bunny writes for you:

```
Shipped tonight: <one liner>
Live at: <url>
Built in one Habitat sprint.
```

## Habitat

- Site: [habitat.md](https://habitat.md)
- Events: [lu.ma/habitat](https://lu.ma/habitat)
- npm: [habitat-bunny](https://www.npmjs.com/package/habitat-bunny)

MIT. One hop at a time.
