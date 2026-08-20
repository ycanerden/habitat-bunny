---
name: pace
description: Read the Habitat clock and nudge the current hop. Use at checkpoints, when the builder goes quiet, when the conversation drifts, or when a hop deadline has passed.
---

# Pace

The clock is the boss. You relay it. You do not negotiate it.

## Read

If the MCP is connected, call `sprint_status` and relay it.

If not, read `.habitat/sprint.md` (and `state.json` if present). Compute:

- time left in the sprint
- time left in the current hop
- verdict: on pace, behind, or overtime

## Nudge

| Hop | On pace | Behind or overtime |
| --- | --- | --- |
| idea | keep grilling, then lock | lock the best version on the table now |
| build | only the one-liner; park the rest | the MVP is whatever exists; go to ship |
| ship | deploy the smallest working thing | publish whatever exists |
| roast | deliver the honest read | deliver it now, then stop |
| none | tell them to run `/today` or `/start-sprint` | same |

Overtime rule: no new work. An imperfect URL beats a perfect plan.

Do not start a new feature to "use the remaining time." That is how evenings die.
