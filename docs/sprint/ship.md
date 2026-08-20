## What it does

`ship` records the artifact: a live URL and one sentence about what actually exists.

The defining constraint: localhost is not shipped. It is a rehearsal. A stranger has to be able to click it without your laptop.

## When to reach for it

Type `/ship`, or the agent reaches for it automatically when something is deployable, when you say you shipped, or when you offer localhost / a screenshot as the finish line.

Reach for this when the core flow works end to end. If you are still adding features, you want [check-scope](./check-scope.md) or [pace](../daily/pace.md).

## Prerequisites

A lock. Shipping before locking is publishing a guess.

## Common questions

**Vercel preview URLs count?**
Yes, if someone who is not you can open them.

**What about a TestFlight / Play Internal link?**
If a stranger can use it without sitting at your desk, it counts. If it needs your phone, it does not.

**Can I roast without this?**
No. [roast](./roast.md) only talks about things that exist at a URL.

## It's working if

- You pasted a `https` link into `.habitat/ships.md`.
- Incognito did not 404.
- The summary names what shipped, not what was planned.

## Where it fits

Chain step: the only door into roast. Map: [ask-bunny](./ask-bunny.md).
