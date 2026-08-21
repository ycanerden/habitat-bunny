Skills live in bucket folders under `skills/`:

- `sprint/`: the Habitat night ritual (lock, build, ship, roast)
- `daily/`: one hop today, the clock, getting unstuck mid-build
- `misc/`: kept around but rarely used, not promoted
- `in-progress/`: beta, public on purpose, feedback wanted, not shipped in the plugin
- `deprecated/`: no longer used

Every skill in `sprint/` or `daily/` (the **promoted** buckets) must have a reference in the top-level `README.md` and an entry in `.claude-plugin/plugin.json`'s `skills` array. The Claude Code plugin ships exactly the promoted set. Skills in `misc/`, `in-progress/`, and `deprecated/` must not appear in either.

Install commands are copied verbatim from [.agents/install-block.md](./.agents/install-block.md). `.claude-plugin/marketplace.json` makes the repo its own single-plugin marketplace. Run `claude plugin validate . --strict` after touching either manifest. Why the MCP server and the skills sit side by side lives in [.agents/adr/0001-skills-sit-beside-the-mcp.md](./.agents/adr/0001-skills-sit-beside-the-mcp.md).

Each skill entry in the top-level `README.md` must link the skill name to its `SKILL.md`.

Each bucket folder has a `README.md` that lists every skill in the bucket with a one-line description, with the skill name linked to its `SKILL.md`. The promoted buckets' `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**. Non-promoted bucket `README.md`s (`misc/`, `in-progress/`) use a flat list.

Skills in `sprint/` and `daily/` also have a human-facing docs page at `docs/<bucket>/<skill-name>.md` (the docs tree mirrors those two bucket folders under `skills/`). When you add, rename, or change the behaviour of a skill in `sprint/` or `daily/`, create or re-sync its docs page following [.agents/writing-docs.md](./.agents/writing-docs.md). A finished page carries four sections: **What it does**, **When to reach for it**, **Common questions**, and **It's working if**. Skills in the non-promoted buckets get **no** docs page.

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, reachable only by the human) or model-invoked (model- or user-reachable). See [.agents/invocation.md](./.agents/invocation.md).

[`ask-bunny`](./skills/sprint/ask-bunny/SKILL.md) is the router that maps every user-reachable skill and how they relate. Whenever you add, rename, remove, or change how a user-reachable skill fits the flows, re-read `ask-bunny`'s `SKILL.md` and update it so the map stays accurate.

To (re)link every skill into the local harness skill directories (`~/.claude/skills`, `~/.agents/skills`), run `scripts/link-skills.sh`. Each entry is a symlink into this repo, so a `git pull` keeps installed skills current. Re-run the script after adding, removing, or renaming a skill.

The MCP server in `src/` is the gate. Skills are the method. Do not move gate logic (URL checks, vague-ICP rejects, hop skips) out of the server and into a skill. If a skill describes a gate, the server must still enforce it when the MCP is installed.

Keep the server complementary: it never writes the builder's code, never calls an LLM, never needs an API key.
