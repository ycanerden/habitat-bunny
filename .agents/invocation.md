# Model-invoked vs user-invoked

Every `SKILL.md` in this repo is a skill. The one axis that splits them is **invocation**, who can reach it:

- **User-invoked**: reachable **only by the human typing its name**. Set `disable-model-invocation: true` in the frontmatter (Claude Code) and `policy.allow_implicit_invocation: false` in `agents/openai.yaml` (Codex). The `description` is **human-facing**: a one-line summary read by a person browsing slash-commands. Strip trigger lists ("Use when the user says…").
- **Model-invoked**: reachable by **model or user**. The default: omit `disable-model-invocation` and the `policy` block from `agents/openai.yaml`. The `description` is **model-facing** and keeps rich trigger phrasing ("Use when the user wants…, mentions…, is lost…") so auto-invocation fires. The test for whether a skill should stay model-invoked: _could the model usefully reach for this autonomously?_

A user-invoked skill may invoke model-invoked skills, but it can never reach another user-invoked skill.

Every skill also carries an `agents/openai.yaml` beside its `SKILL.md`. It holds Codex UI metadata: `interface.display_name` and `interface.short_description` for the skill picker, and, for user-invoked skills, the `policy.allow_implicit_invocation: false` that pairs with `disable-model-invocation`. Keep the two in sync: a skill is user-invoked in both harnesses or neither.

Bucket `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**.

## Dependencies between them

Dependencies are expressed as an explicit instruction to **call the Skill tool** with the named skill (`Call the Skill tool with "grilling"`), not deep `../other-skill/FILE.md` cross-references, and not a bare `/skill`-style mention left for the model to interpret. Naming the tool is what gets it fired. Dropping the leading `/` also keeps this harness-neutral.

The Skill tool takes one skill per call. A step that needs two skills is two calls, not one call with two names.

This convention only holds when the named skill is **model-invoked**. A user-invoked skill can never be reached this way. When a step's precondition is a user-invoked skill (for example `setup-habitat`), phrase it as an instruction for the human: "tell the user to run `/setup-habitat`", never as a Skill tool call.

## MCP tools vs Skill tool

If the habitat-bunny MCP server is connected, prefer its tools as the **gate**: `start_sprint`, `lock_idea`, `check_scope`, `sprint_status`, `next_hop`, `ship`, `roast`, `ship_log`. The skills still run the method (the questions, the voice, the roast). The tools hold the no.

If the MCP is not connected, the skill enforces the same gates in prose and writes the same files under `.habitat/`.
