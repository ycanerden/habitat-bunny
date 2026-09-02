# Launch checklist: habitat-bunny

Everything below is prepared; the steps marked (you) need the npm account owner, a domain, or the Habitat social accounts.

The launch format is borrowed from treg's "Claude for people search" (treg.to/people-search, 1 Sep 2026): one job in the headline, the agent's name in the slot, a self-playing film of the tool doing the job, a struck-through bill of what people pay today, and a paste-a-prompt install. Ours is "Claude Code for shipping tonight". Same shape, our ritual.

## 1. Publish to npm (you)

```bash
npm run build
npm run smoke        # must print SMOKE OK
npm run check:skills # must print SKILLS OK
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

## 2. Deploy the site (you)

`site/index.html` is one self-contained file: no build, no framework, fonts from Google Fonts. Deploy the `site/` folder anywhere static.

```bash
npx vercel deploy site --prod        # e.g. bunny.habitat.md
# or: GitHub Pages, source = /site on main
```

After the domain exists:

1. Serve `llms.txt` at `<domain>/llms.txt` (copy the root file into `site/` at deploy time, or rewrite `/llms.txt` to the raw GitHub file).
2. Change the paste-a-prompt line in three places to `set up habitat-bunny — <domain>/llms.txt`: `site/index.html` (the `#setup` command card and its `data-text`), `.agents/install-block.md`, and `README.md`. The wording rule in `.agents/install-block.md` still applies: change it there first.
3. Set `homepage` in `package.json` to the domain if it is not habitat.md.

Check before announcing: the film plays and loops when `#film` scrolls into view; the copy button copies the prompt; `prefers-reduced-motion` shows the finished sprint instead of the film; the page reads on a 390px phone.

## 3. Directory listings

- skills.sh: the repo is the catalog. After merge, confirm https://skills.sh/ycanerden/habitat-bunny lists the promoted skills.
- Cursor MCP directory: submit at cursor.com/directory (Anysphere reviews submissions).
- Smithery: smithery.ai, sign in with GitHub and add the server (stdio, `npx -y habitat-bunny`).
- Glama and PulseMCP: auto-index public GitHub repos with MCP servers; submit manually at glama.ai/mcp/servers and pulsemcp.com/submit.
- mcp.so: submit via their GitHub issues form.
- awesome-mcp-servers lists on GitHub: open PRs adding habitat-bunny under productivity/workflow.

## 4. Community launch (you)

Sequence that worked for comparable launches (research: community first, receipts, no cold Product Hunt):

1. Luma blast to the Habitat list: frame it as "the Habitat night, now in your editor". Ask people to run one sprint this week and reply with their ship log.
2. Post ship logs (with permission) as social proof. The share object is the ship log, not a star.
3. The launch post from the personal account. Draft below. Attach a screen recording of the `#film` section looping once (about 30 seconds); that is the launch video, no editing needed.
4. Launch event: run the next Habitat evening ON the tool. Everyone pastes the setup line in the first ten minutes; the event brief goes in through event mode.

## 5. Draft copy

### The launch post (X, LinkedIn)

Same skeleton treg used. One job, one number, one claim, one link, repo in the first reply.

```
Introducing Claude Code for shipping tonight

No more $2,500 cohorts, just one evening

Claude Code now runs the Habitat night: grill the idea, lock the scope, keep the clock, refuse localhost, roast what shipped

200+ MVPs shipped this way, 8 cities
Fully open source, nothing leaves your machine

Try it at <domain>
Git repo below 👇
```

First reply: `Open source here: https://github.com/ycanerden/habitat-bunny`

Variants for the same page, one per week, swapping the job and the agent in the slot:

- "Introducing Codex for winning a hackathon": event mode, the clock is the deadline, the roast is the judging rubric.
- "Introducing Cursor for finishing": `/today`, one sentence to a URL before you stop.
- "Introducing Claude Code for saying no": `check_scope`, the backlog, the localhost refusal.

### Luma / community email

Subject: the Habitat night now fits in your editor

We turned the Habitat sprint into a skill. It is called habitat-bunny and it runs inside Claude Code, Codex, Cursor, or whatever you build with.

Your AI builds. The bunny keeps the clock, grills your idea before you build it, parks your scope creep, and does not let you stop before there is a URL a stranger can click. Same ritual as our evenings: lock, build, ship, roast.

Free, open source, nothing leaves your machine. Paste this into your agent:

set up habitat-bunny — github.com/ycanerden/habitat-bunny/blob/main/llms.txt

Run one sprint this week and reply with your ship log. Best one gets featured.

### X thread skeleton (long form, if the single post lands)

1/ We made 200+ people ship a real MVP in one evening. Across 8 cities. Most of them had never shipped anything.

2/ The secret was never the advice. It was the container: a clock, a locked scope, and a room waiting to see what you made.

3/ So we put the container inside the agent you already build with. Meet habitat-bunny: one skill that runs the Habitat sprint in Claude Code, Codex, or Cursor.

4/ Your agent builds. The bunny grills your idea first (one question at a time, no compliments), locks the scope, keeps the clock, and parks every shiny mid-build idea in a backlog.

5/ localhost does not count as shipped. The bunny will tell you.

6/ At a hackathon? Paste the event brief. The clock becomes the submission deadline, the roast scores you against the actual judging criteria.

7/ Free, open source, no backend, no account, nothing leaves your machine. One line to set up. [link]

8/ Built by Habitat. We still do the evenings: [lu.ma/habitat]

## 6. After launch

- Watch npm weekly downloads and GitHub stars as the adoption signal named in the plan.
- Collect ship logs; they are the testimonial engine. Append them to SHIPS.md by PR.
- Decision point from the plan: only on real traction, consider the hosted organizer console (live dashboard, rankings, ceremony view) and a remote deployment for ChatGPT apps. Until then: no backend, no account, no API keys.
