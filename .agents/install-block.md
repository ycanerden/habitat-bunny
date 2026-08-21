# The canonical install block

One install story, one wording. `README.md` and every page under `docs/` that mentions install must say **this** and nothing else. Change it here first, then propagate.

There are two complementary pieces. **Skills** are the method (the grill, the hops, the roast). The **MCP** is the gate (it will refuse a vague ICP, a skipped hop, a localhost URL). Install skills first. Add the MCP if you want the no to be a tool, not a suggestion.

The two *skill* routes are exclusive. The plugin is a managed bundle. skills.sh writes files you own and edit. Installing both leaves every skill twice: always say "pick one". The MCP is a third thing and can sit next to either.

## 1. Get the skills

### Claude Code: the plugin

<canonical-block name="claude-code">

```bash
/plugin marketplace add ycanerden/habitat-bunny
/plugin install habitat-bunny
```

</canonical-block>

### Codex, Cursor, and other agents: skills.sh

<canonical-block name="skills-sh-whole-set">

```bash
npx skills@latest add ycanerden/habitat-bunny
```

Pick the skills you want, and which coding agents to install them on. **The installer lets you choose which skills to take, so make sure `setup-habitat` is one of them.**

</canonical-block>

The single-skill form, wherever one skill is named on its own. Note that **`docs/` pages are not a consumer of this block**: they orient, they do not install.

<canonical-block name="skills-sh-one-skill">

```bash
npx skills@latest add ycanerden/habitat-bunny --skill=<name>
```

```bash
npx skills@latest update <name>
```

</canonical-block>

## 2. Run `/setup-habitat`

In your agent, run it once per repo. It writes the burrow (`.habitat/`) and asks how you sprint.

## 3. Optional: the MCP gate

<canonical-block name="mcp">

```bash
# Claude Code
claude mcp add habitat-bunny -- npx -y habitat-bunny
```

Cursor / Claude Desktop, one click: [Add habitat-bunny](cursor://anysphere.cursor-deeplink/mcp/install?name=habitat-bunny&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImhhYml0YXQtYnVubnkiXX0=)

</canonical-block>

## Not the install story

`.claude-plugin/marketplace.json` *is* the documented Claude Code route (this repo is not on the official marketplace yet). Do not invent a second marketplace add command.
