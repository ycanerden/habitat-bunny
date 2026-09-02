## What it does

`picasso` deletes whatever can go without losing meaning. Hand it a sentence, a paragraph, today's plan, a spec, a landing page, a pitch, or a product, and it takes pieces out one at a time, checking after each one. What survives is the core.

The defining constraint: it only removes. No rewording, no polish, no replacement feature. If the after is not shorter than the before, the pass failed.

## When to reach for it

Type `/picasso`, or the agent reaches for it automatically when you say "cut it", "too long", "what can I delete", or when you are about to ship, launch, or DM a customer with more on the table than the one-liner.

Reach for this when the thing already exists and is fat. If the idea is mush, you want [grilling](./grilling.md). If a *new* feature just appeared mid-build, you want [check-scope](./check-scope.md): that parks one incoming idea. Picasso hunts everything that is already there and should not be.

| You have… | Use |
| --- | --- |
| A shiny add during build | [check-scope](./check-scope.md) |
| A sentence, plan, page, pitch, or product with too much in it | `picasso` |
| No one-liner yet | [grilling](./grilling.md) |

## The one test

Take a piece out. Read what is left. Meaning intact: it stays out. Meaning lost: put it back and try a smaller piece inside it. Stop when every remaining piece fails the test.

The test does not care about scale. A word in a sentence, a step in a plan, a feature in a product: same move.

## Le Taureau

The name is the Picasso tactic, a rule one of our founders learned from a CTO who learned it from Picasso. In the winter of 1945 Picasso drew a bull and then redrew it eleven times, each lithograph with less than the last, until a few lines were still unmistakably a bull. Nothing was added between states.

The skill works the same way: it shows you the cut as numbered states, each shorter, and stops at the one where the next deletion would break the meaning.

## Common questions

**Is this only for code or copy?**
No. The usual surfaces are a sentence, a plan for today, a hero paragraph, a demo script, a first DM. Features are the biggest surface, words the smallest. Same test.

**How is this different from "make it shorter"?**
Shorter is a target. Picasso is a test. It never swaps a word for a shorter word; it removes the word and checks whether you still understand the sentence. Rewording is not a state.

**Will it delete my settings page?**
If settings are not the one-liner, yes, or it will tell you to hide them and park the work. Explaining a parked feature to a customer is how it comes back.

**What if I need those features next week?**
Park them. [check-scope](./check-scope.md) writes `.habitat/backlog.md`. Picasso is tonight and the first conversation, not the roadmap.

**Why is this good for focus?**
Because a plan that survives the test has one deliverable left on it, and a sentence that survives it has one fact. Focus is what remains when the rest is gone, not something you add.

## It's working if

- The last state is shorter than the first, and you can point at what died.
- Nothing left survives the test: take any piece out and the meaning changes.
- You can say the one-liner without "and also".
- A stranger would not notice a missing settings page because you never mentioned it.

## Where it fits

A gate under the build hop, and a standalone you can run on any sentence, plan, or draft before someone else sees it. The sprint calls it before [ship](./ship.md). Neighbours: [check-scope](./check-scope.md) (park one incoming idea), [grilling](./grilling.md) (when there is no core yet). Map: [ask-bunny](./ask-bunny.md).
