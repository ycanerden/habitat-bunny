# Habitat

The Habitat night, as a set of skills and a local MCP gate. Your agent writes the code. The bunny keeps the clock honest.

## Language

**Hop**:
One gated step of a sprint: lock the idea, build, ship, or roast. The builder is always on exactly one hop.
_Avoid_: phase, stage, step (except when quoting a user)

**Sprint**:
A timeboxed container with a clock and a locked one-liner. Default is one evening (4 hours). Event mode uses the real submission deadline.
_Avoid_: project, session (use **session** only for the agent conversation)

**Lock**:
The moment the idea hop closes. Four gates must pass: a specific problem, a findable ICP, a one-liner a friend can repeat, and at least two things that are not being built tonight.

**ICP**:
The target user, specific enough that the builder knows where to find 10 of them this week. "Everyone", "founders", "developers", "students" alone all fail.
_Avoid_: persona, audience, user segment

**One-liner**:
One sentence a non-technical friend can repeat. Names the ONE feature that proves the value. Not a platform, not a feature list.

**Parked**:
A mid-sprint feature idea written to `.habitat/backlog.md` and not built tonight. The backlog remembers so the builder does not have to.

**Ship**:
A live URL a stranger can click. localhost, 127.0.0.1, and `*.local` do not count.

**Roast**:
The honest read after a ship: promise vs artifact, weakest dimension, one next validation move.

**Burrow**:
The local `.habitat/` folder. Human-readable markdown plus machine state. Delete it and the bunny forgets.

**Gate**:
A check the bunny (or the skill, if the MCP is not installed) will refuse to pass. A prompt is a suggestion. A gate is a no.

**Clock**:
The remaining time in the current hop and in the sprint. The clock is the boss in the build hop.

## Relationships

- A **Sprint** is a sequence of **Hops** under one **Clock**
- A **Lock** produces a **One-liner**, an **ICP**, and an out-of-scope list
- A **Parked** idea is not a **Hop**
- A **Ship** is the only thing a **Roast** may talk about
- The **Burrow** holds the **Sprint** the agent can read without the MCP

## Flagged ambiguities

- "session" means the agent conversation, not the Habitat evening. The evening is a **Sprint**.
- "backlog" here is only parked mid-sprint ideas in `.habitat/backlog.md`. It is not a product roadmap and not an issue tracker.
- "coach" is the product role (founder coach). The voice in the skills is still the bunny.
