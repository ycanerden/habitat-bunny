# Launch checklist: habitat-bunny

Everything below is prepared; the steps marked (you) need the npm account owner or the Habitat social accounts.

## 1. Publish to npm (you)

```bash
cd packages/mcp
npm run build
npm run smoke        # must print SMOKE OK
npm login            # npm account that will own the package
npm publish          # publishConfig.access is already "public"
```

Then verify the one-line install works from a clean folder:

```bash
npx -y habitat-bunny   # should print "habitat-bunny is listening" to stderr
```

Notes:
- The name `habitat-bunny` must be free on npm at publish time. Fallbacks if taken: `habitat-mcp`, `bunny-sprint`, or a scoped name under your npm username.
- If you use a scoped fallback, update the README install snippets and regenerate the Cursor deeplink: the deeplink config is base64 of `{"command":"npx","args":["-y","<package-name>"]}`.

## 2. Directory listings (you)

The repo is packaged for the four agent directories. Each portal still needs a human click after this lands on `main`. Do not change the README install commands until a listing is actually live.

Repo: https://github.com/ycanerden/habitat-bunny

Listing copy, reuse everywhere:

> The Habitat night, inside your editor. Your agent writes the code. The bunny grills the idea, parks scope creep, and will not call it shipped until a stranger can click a URL. Skills plus a local MCP gate. No account. Nothing leaves your machine.

### OpenAI Plugins Directory (ChatGPT / Codex)

- Package: `.codex-plugin/plugin.json` + promoted skills + local `.mcp.json`.
- Submit at https://developers.openai.com/plugins/deploy/submission as **skills only**.
- Do not submit the MCP to the public directory. That path wants a production HTTPS server and a privacy policy. This package is local stdio on purpose (`npx -y habitat-bunny`). Codex still picks up `.mcp.json` when someone installs the plugin from a repo marketplace.
- Console / Team plan: required for the public form. Individual authors can start at the same portal; if it asks for a workspace, that is the gate.
- After approval, publish from the portal or it stays invisible.

### Claude plugin directory (Cowork / Claude Code)

- Package: `.claude-plugin/` + `.mcp.json`. Already valid as a self-hosted marketplace (`/plugin marketplace add ycanerden/habitat-bunny`).
- Submit the public GitHub URL at https://platform.claude.com/plugins/submit (Console: Developer/Admin/Owner). Team/Enterprise owners can also use https://claude.ai/admin-settings/directory/submissions/plugins/new.
- Run `claude plugin validate . --strict` before submitting.
- This lands in `anthropics/claude-plugins-community`, not Anthropic's curated official marketplace. No public form adds you to official.

### Cursor Marketplace

- Package: `.cursor-plugin/plugin.json`, logo at `assets/logo.svg`, MCP at `.mcp.json`.
- Sign in and submit the public repo at https://cursor.com/marketplace/publish.
- They review whatever is on `main`. MIT is the license they want.

### xAI / Grok Build plugin marketplace

- Package: `.grok-plugin/plugin.json` + `.mcp.json`.
- Open a PR against https://github.com/xai-org/plugin-marketplace adding this entry to `.grok-plugin/marketplace.json`. Pin `sha` to the merge commit on `main`:

```json
{
  "name": "habitat-bunny",
  "description": "The Habitat night, inside the editor. Grill the idea, park scope creep, refuse localhost, roast what shipped. Local MCP gate plus skills. No account, nothing leaves your machine.",
  "category": "development",
  "source": {
    "source": "url",
    "url": "https://github.com/ycanerden/habitat-bunny.git",
    "sha": "REPLACE_WITH_40_CHAR_MAIN_SHA"
  },
  "homepage": "https://habitat.md",
  "keywords": ["habitat", "ship", "sprint", "hackathon", "founder", "mcp"],
  "domains": ["habitat.md"]
}
```

Then in that repo: `python3 scripts/generate-plugin-index.py && python3 scripts/validate-catalog.py`.

### Also still worth doing

- skills.sh: confirm https://skills.sh/ycanerden/habitat-bunny lists the promoted skills.
- Smithery: smithery.ai, stdio, `npx -y habitat-bunny`.
- Glama and PulseMCP: glama.ai/mcp/servers and pulsemcp.com/submit.
- mcp.so: their GitHub issues form.
- awesome-mcp-servers: PR under productivity/workflow.

## 3. Community launch (you)

Sequence that worked for comparable launches (research: community first, receipts, no cold Product Hunt):

1. Luma blast to the Habitat list: frame it as "the Habitat night, now in your editor". Ask people to run one sprint this week and reply with their ship log.
2. Post ship logs (with permission) as social proof.
3. X thread from the personal account. Draft below.
4. Launch event: run the next Habitat evening ON the tool. Everyone installs it in the first ten minutes; the event brief goes in through event mode.

## 4. Draft copy

### Luma / community email

Subject: the Habitat night now fits in your editor

We turned the Habitat sprint into a tool. It is called habitat-bunny: a tiny local MCP server for Cursor, Claude Code, and Claude Desktop.

Your AI builds. The bunny keeps the clock, grills your idea before you build it, parks your scope creep, and does not let you stop before there is a URL a stranger can click. Same ritual as our evenings: lock, build, ship, roast.

Free, open source, nothing leaves your machine. Install:

claude mcp add habitat-bunny -- npx -y habitat-bunny

Run one sprint this week and reply with your ship log. Best one gets featured.

### X thread skeleton

1/ We made 200+ people ship a real MVP in one evening. Across 8 cities. Most of them had never shipped anything.

2/ The secret was never the advice. It was the container: a clock, a locked scope, and a room waiting to see what you made.

3/ So we put the container inside Cursor and Claude Code. Meet habitat-bunny: a local MCP server that runs the Habitat sprint in your editor.

4/ Your agent builds. The bunny grills your idea first (one question at a time, no compliments), locks the scope, keeps the clock, and parks every shiny mid-build idea in a backlog.

5/ localhost does not count as shipped. The bunny will tell you.

6/ At a hackathon? Paste the event brief. The clock becomes the submission deadline, the roast scores you against the actual judging criteria.

7/ Free, open source, no backend, no account, nothing leaves your machine. One line to install. [link]

8/ Built by Habitat. We still do the evenings: [lu.ma/habitat]

## 5. After launch

- Watch npm weekly downloads and GitHub stars as the adoption signal named in the plan.
- Collect ship logs; they are the testimonial engine.
- Decision point from the plan: only on real traction, consider the hosted organizer console (live dashboard, rankings, ceremony view) and a remote deployment for ChatGPT apps.
