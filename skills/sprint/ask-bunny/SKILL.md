---
name: ask-bunny
description: Ask which Habitat skill or flow fits your situation.
disable-model-invocation: true
---

# Ask bunny

You do not remember every hop, so ask.

A **flow** is a path through the skills. Most work travels the **sprint**. One on-ramp covers "I am already building and I am lost." Everything else is standalone, or a gate that runs underneath.

## The sprint: lock → build → ship → roast

The Habitat night. You have an evening (or a deadline) and you want a URL a stranger can click.

1. Tell the user to run `/setup-habitat` if `.habitat/` is missing.
2. **`/start-sprint`** starts the clock. Solo, team, or event. Event mode needs the brief before the clock starts.
3. Call the Skill tool with "grilling". The idea hop does not close until four gates pass. Then lock.
4. Build only the locked one-liner. Any new feature idea mid-build: call the Skill tool with "check-scope".
5. When the core flow works, call the Skill tool with "ship". No URL, no next hop. localhost does not count.
6. Call the Skill tool with "roast". The sprint ends on the honest read, not on the deploy.

If the habitat-bunny MCP is connected, use its tools as the gate (`start_sprint`, `lock_idea`, `check_scope`, `ship`, `roast`). The skills still run the method.

## On-ramp: I am already building

The builder did not say "start a sprint." They said they do not know what they are building.

- **`/today`**. One sentence for today. Grill if the sentence is mush. Take that sentence to a URL before you stop.

Do not invent a hop name for them to type. Route them.

## Underneath

Model-invoked gates that the flows above pull in. Reach for them directly when the **gate**, not the ritual, is the problem.

- **grilling**: one question at a time until the lock is honest
- **check-scope**: park the shiny idea
- **ship**: refuse anything a stranger cannot open
- **roast**: promise vs artifact
- **pace**: the clock is talking, relay it

## Standalone

- **`/start-sprint`**: the full evening, including event and team
- **`/today`**: one hop, no evening container
- **`/setup-habitat`**: run-once. Writes the burrow. The other skills assume it.

## Precondition

**`/setup-habitat`**: run before the first sprint in a repo. Custom burrows also work, as long as `.habitat/` is where state lives.
