# Writing docs pages

Every skill in `sprint/` and `daily/` has a human-facing **docs page** at `docs/<bucket>/<skill-name>.md`. The docs tree mirrors those two bucket folders under `skills/`. The page is not the skill and not a copy of `SKILL.md`. Only these two buckets are promoted; the rest (`misc/`, `in-progress/`, `deprecated/`) ship no docs page.

Most of these skills are **user-invoked**: the agent will never fire them for you, so *you* are the index that has to remember they exist and when to reach for them. The job of a docs page is to relieve that: one reader, one skill, when to reach for it, where it sits.

Act whenever a promoted skill is added, renamed, or has its behaviour changed: create or re-sync its docs page. A rename moves the file too. Skills in `misc/`, `in-progress/`, and `deprecated/` get no page. A skill moving *into* `sprint/` or `daily/` gains a page; one moving the other way loses it.

Use **repo-relative** links inside this repo (`../../skills/sprint/ask-bunny/SKILL.md`). When a page is later published on habitat.md, convert those to absolute URLs. Do not invent a published-URL scheme in the page body.

A page carries **no install commands**. Install wording lives in [the install block](./install-block.md).

There is no H1. The page takes its title from the slug.

## Page structure

Fill the template below, keeping its order. The **fixed frame** (`## What it does`, `## When to reach for it`, `## Where it fits`) appears on every page. `## Prerequisites` and the free-form substance sections carry only what this particular skill needs; delete the rest.

Four sections make a page worth reading: `What it does`, `When to reach for it`, `Common questions`, `It's working if`.

<page-template>

## What it does

One or two plain-language paragraphs. Lead with the skill's one-sentence job, then state the **defining constraint**: the single fact that makes this skill behave differently from the obvious default. Write it as a plain declarative sentence, never a labelled aside.

## When to reach for it

- **Invocation mode.** User-invoked: "You invoke this by typing `/<name>`, and the agent won't reach for it on its own." Model-invoked: "Type `/<name>`, or the agent reaches for it automatically when a task fits."
- **Trigger boundary.** "Reach for this when …". Where the skill is confusable with a sibling, add the other half.

## Prerequisites

Optional. Include only when the skill needs something in place (a burrow, a lock, a live URL). Omit the heading otherwise.

## <free-form middle>

One to three short sections in the skill's own vocabulary. Surface the skill's leading word (`lock`, `hop`, `gate`, `clock`, `parked`, `roast`).

## Common questions

Questions a builder would actually ask, each in bold with the answer beneath. Order sharpest first. Omit the heading where there is nothing worth answering. Do not pad.

## It's working if

A few bullets the reader can check without opening `SKILL.md`.

## Where it fits

Always present. Name the role (chain step, run-once setup, standalone) and point at [ask-bunny](../../skills/sprint/ask-bunny/SKILL.md).

</page-template>

## Conventions

- Explain the **why**, not the process. The page orients; it never reproduces the `SKILL.md` steps.
- Use Habitat language from [CONTEXT.md](../CONTEXT.md): hop, sprint, lock, ICP, one-liner, parked, ship, roast, burrow, gate, clock.
- Branches go in a table or a list, never in a paragraph.
- Keep the page itself short. The bunny does not write essays.
