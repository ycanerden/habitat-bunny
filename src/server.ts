// Habitat bunny MCP server: tool registration + sprint logic.
// Complementary by design: every tool returns pacing, gates, and method
// instructions that the HOST model executes. This server never calls an LLM.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  agentContract,
  BUILD_RULES,
  BUNNY_PERSONA,
  DAILY_GATES,
  DAILY_RULES,
  EVENT_ROAST_ADDENDUM,
  FORGE_RULES,
  IDEA_GATES,
  LENSES,
  LOST_OPENER,
  ONBOARDING_QUESTION,
  ROAST_RUBRIC,
  SHIP_CHECKLIST,
} from "./method.js";
import {
  appendHistory,
  appendShipLog,
  endOfLocalDay,
  fmtClock,
  fmtDuration,
  hopLabel,
  pace,
  parkFeature,
  readBurrow,
  readEventBrief,
  readHistory,
  readState,
  rollDailyIfNeeded,
  scheduleHops,
  shipsThisWeek,
  shipStreak,
  slugify,
  todayKey,
  writeBurrow,
  writeEventBrief,
  writeState,
  type DailyHop,
  type SprintState,
} from "./state.js";

const COMMUNITY_URL = "https://lu.ma/habitat";
const SITE_URL = "https://joinhabitat.eu";

const VAGUE_ICP = [
  /^everyone$/i,
  /^everybody$/i,
  /^people$/i,
  /^users$/i,
  /^consumers$/i,
  /^millennials$/i,
  /^gen ?z$/i,
  /^students$/i,
  /^developers$/i,
  /^founders$/i,
  /^businesses$/i,
  /^companies$/i,
  /^smes?$/i,
];

const VAGUE_TODAY = [
  /^work on\b/i,
  /^improve\b/i,
  /^fix bugs?\b/i,
  /^refactor\b/i,
  /^polish\b/i,
  /^update\b/i,
  /^think about\b/i,
  /^plan\b/i,
];

function text(body: string) {
  return { content: [{ type: "text" as const, text: body.trim() }] };
}

function noSprint() {
  return text(
    `No active sprint in this folder.\n\n` +
      `For a normal building day, call today. For a Habitat night or hackathon, call start_sprint.`,
  );
}

function isVagueDailyIntent(intent: string): boolean {
  const trimmed = intent.trim();
  if (trimmed.length < 20) return true;
  if (trimmed.split(/\s+/).length < 5) return true;
  return VAGUE_TODAY.some((rx) => rx.test(trimmed));
}

function rejectShipUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return `"${url}" is not a URL the bunny can hop to. Full https link, please.`;
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return `The ship URL must be http(s). "${parsed.protocol}" does not count as shipped.`;
  }
  if (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname.endsWith(".local")
  ) {
    return (
      `localhost is not shipped; it is a rehearsal. Deploy it where a stranger can click it ` +
      `(Vercel, Netlify, a share link, GitHub Pages), then call ship again with the public URL.`
    );
  }
  return null;
}

function dailyClockLine(daily: DailyHop, now = new Date()): string {
  if (daily.status === "shipped") {
    return `Today's hop already shipped${daily.shipped ? `: ${daily.shipped.url}` : "."}`;
  }
  const remaining = new Date(daily.endsAt).getTime() - now.getTime();
  if (remaining < 0) {
    return `CLOCK: the day ended ${fmtDuration(remaining)}. Ship what exists.`;
  }
  return `CLOCK: ${fmtDuration(remaining)} left in today's hop.`;
}

function shareTemplateDaily(daily: DailyHop): string {
  const what = daily.shipped?.summary ?? daily.intent;
  const url = daily.shipped?.url ?? "";
  return [
    "Share template (paste anywhere):",
    "",
    `> Shipped today: ${what}`,
    `> Live at: ${url}`,
    `> One hop. Habitat bunny.`,
  ].join("\n");
}

function cadenceLine(cwd: string): string {
  const history = readHistory(cwd);
  const week = shipsThisWeek(history);
  const streak = shipStreak(history);
  const parked = readBurrow(cwd).parked.length;
  return (
    `This week: ${week} ship${week === 1 ? "" : "s"}. ` +
    `Streak: ${streak} day${streak === 1 ? "" : "s"}. ` +
    `Parked: ${parked}.`
  );
}

function recordDailyShip(
  cwd: string,
  daily: DailyHop,
  url: string,
  summary: string,
  now: Date,
): DailyHop {
  daily.shipped = { url, summary: summary.trim(), at: now.toISOString() };
  daily.status = "shipped";
  const burrow = readBurrow(cwd);
  burrow.daily = daily;
  writeBurrow(cwd, burrow);
  appendHistory(cwd, {
    id: `daily-${daily.date}`,
    mode: "daily",
    date: daily.date,
    startedAt: daily.startedAt,
    finishedAt: daily.shipped.at,
    shipped: true,
    url,
    summary: daily.shipped.summary,
    oneLiner: daily.intent,
  });
  appendShipLog(
    cwd,
    [
      `## daily-${daily.date}`,
      "",
      `- Shipped: ${daily.shipped.summary}`,
      `- URL: ${daily.shipped.url}`,
      `- Hop: ${daily.intent}`,
      `- Mode: daily`,
      "",
      shareTemplateDaily(daily),
    ].join("\n"),
  );
  return daily;
}

function clockLine(state: SprintState): string {
  const report = pace(state);
  const overall = fmtDuration(report.overallRemainingMs);
  const hopMs = report.hopRemainingMs;
  if (state.currentHop === "done") {
    return `Sprint finished. Total window was ${fmtDuration(
      new Date(state.endsAt).getTime() - new Date(state.startedAt).getTime(),
    )}.`;
  }
  if (report.verdict === "overtime") {
    return `CLOCK: the sprint ended ${overall}. Everything from here is borrowed time. Ship what exists.`;
  }
  if (report.verdict === "behind") {
    return `CLOCK: ${overall} left overall, and the current hop deadline passed ${fmtDuration(
      hopMs,
    )}. Time to hop forward, not to polish.`;
  }
  return `CLOCK: ${overall} left overall, ${fmtDuration(hopMs)} left in the current hop (${hopLabel(
    state.currentHop,
  )}).`;
}

function shareTemplate(state: SprintState): string {
  const what = state.shipped?.summary ?? state.idea?.oneLiner ?? "an MVP";
  const url = state.shipped?.url ?? "";
  const duration = fmtDuration(
    new Date(state.endsAt).getTime() - new Date(state.startedAt).getTime(),
  );
  return [
    "Share template (paste anywhere):",
    "",
    `> Shipped tonight: ${what}`,
    `> Live at: ${url}`,
    `> Built in one Habitat sprint (${duration} on the clock).`,
    `> Habitat runs one-night ship sprints for AI builders: ${COMMUNITY_URL}`,
  ].join("\n");
}

export function createServer(cwd: string): McpServer {
  const server = new McpServer({
    name: "habitat-bunny",
    version: "0.1.0",
  });

  // ---- today ---------------------------------------------------------------
  server.registerTool(
    "today",
    {
      title: "Figure out what we are actually building",
      description:
        "Call this yourself whenever the builder is writing code, adding features, or is not sure " +
        "what the product is. Do not wait for them to say hop, sprint, today, or Habitat. " +
        "Pass their own words as ramble. The bunny will grill until there is one thing a stranger " +
        "can click, then you may build. If they already know the one sentence, pass intent plus " +
        "out_of_scope to lock. Use start_sprint only for a Habitat night or hackathon.",
      inputSchema: {
        ramble: z
          .string()
          .optional()
          .describe(
            "The builder's own words, messy is fine: what they are doing, what they are unsure about, what they opened the editor to make. Required when they are lost. Do not clean it up.",
          ),
        intent: z
          .string()
          .optional()
          .describe(
            "Only after the grill: one sentence naming a visible outcome a stranger can click today.",
          ),
        out_of_scope: z
          .array(z.string())
          .optional()
          .describe("At least one tempting thing you are NOT doing today. Required when locking an intent."),
        hours: z
          .number()
          .min(0.5)
          .max(16)
          .optional()
          .describe("Optional focus window in hours. Default is the rest of the local calendar day."),
      },
    },
    async (args) => {
      const now = new Date();
      const sprint = readState(cwd);
      if (sprint && sprint.status === "active") {
        return text(
          [
            `A Habitat sprint is already live (${sprint.id}). The night takes the clock.`,
            clockLine(sprint),
            `Current hop: ${hopLabel(sprint.currentHop)}.`,
            sprint.idea ? `Locked one-liner: "${sprint.idea.oneLiner}".` : "Idea is not locked yet.",
            "",
            `Call sprint_status to continue the night. Daily hops wait until the sprint closes.`,
          ].join("\n"),
        );
      }

      const burrow = rollDailyIfNeeded(cwd, now);
      const daily = burrow.daily;

      if (!args.intent) {
        if (daily && daily.status === "active") {
          return text(
            [
              BUNNY_PERSONA,
              "",
              `Already locked: "${daily.intent}"`,
              `Not today: ${daily.outOfScope.join("; ")}`,
              dailyClockLine(daily, now),
              cadenceLine(cwd),
              "",
              args.ramble
                ? `They just said: "${args.ramble.trim()}". If that is a new feature, call check_scope. Do not reopen the grill.`
                : `Build only that sentence. New ideas go through check_scope. When a stranger can click it, call ship.`,
              "",
              agentContract(),
            ].join("\n"),
          );
        }
        if (daily && daily.status === "shipped") {
          return text(
            [
              `Already shipped today. ${daily.shipped?.url ?? ""}`,
              cadenceLine(cwd),
              "",
              `Park anything else with check_scope. Do not start a second product today.`,
            ].join("\n"),
          );
        }

        const ramble = args.ramble?.trim() || burrow.draft?.ramble;
        if (args.ramble?.trim()) {
          burrow.draft = { ramble: args.ramble.trim(), at: now.toISOString() };
          writeBurrow(cwd, burrow);
        }

        return text(
          [
            BUNNY_PERSONA,
            "",
            ramble
              ? `They are building and they are not sure. Their words: "${ramble}"`
              : `They are building and they have not said what it is. That is enough to start.`,
            cadenceLine(cwd),
            "",
            FORGE_RULES,
            "",
            LENSES,
            "",
            DAILY_GATES,
            "",
            LOST_OPENER,
            "",
            DAILY_RULES,
            "",
            agentContract(),
          ].join("\n"),
        );
      }

      if (daily && daily.status === "shipped") {
        return text(
          `Today already shipped: ${daily.shipped?.url ?? daily.intent}. ` +
            `Park "${args.intent.trim()}" with check_scope. One hop a day.`,
        );
      }
      if (daily && daily.status === "active") {
        return text(
          `Today's hop is already locked: "${daily.intent}". No re-litigating mid-day. ` +
            `New directions go to check_scope. ${dailyClockLine(daily, now)}`,
        );
      }

      if (isVagueDailyIntent(args.intent)) {
        return text(
          `Gate 1 failed: "${args.intent.trim()}" is a chore, not a hop. ` +
            `Name a visible outcome a stranger can click today. ` +
            `"Work on the app" and "fix bugs" will never lock.\n\n${DAILY_GATES}`,
        );
      }
      const outOfScope = (args.out_of_scope ?? []).map((item) => item.trim()).filter(Boolean);
      if (outOfScope.length < 1) {
        return text(
          `Gate 2 failed: name at least one thing you are NOT doing today. ` +
            `That is how the hop stays one hop.\n\n${DAILY_GATES}`,
        );
      }

      const endsAt = args.hours
        ? new Date(now.getTime() + args.hours * 3_600_000)
        : endOfLocalDay(now);
      const locked: DailyHop = {
        date: todayKey(now),
        intent: args.intent.trim(),
        outOfScope,
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        status: "active",
      };
      burrow.daily = locked;
      burrow.draft = undefined;
      writeBurrow(cwd, burrow);

      return text(
        [
          `Locked for ${locked.date}. "${locked.intent}"`,
          `Not today: ${locked.outOfScope.join("; ")}`,
          "",
          dailyClockLine(locked, now),
          cadenceLine(cwd),
          "",
          DAILY_RULES,
          "",
          BUILD_RULES.replaceAll("sprint_status", "today").replaceAll("tonight", "today"),
          "",
          `Now build only that sentence. The bunny will keep the day honest.`,
        ].join("\n"),
      );
    },
  );

  // ---- start_sprint --------------------------------------------------------
  server.registerTool(
    "start_sprint",
    {
      title: "Start a Habitat ship sprint",
      description:
        "Starts a timeboxed ship sprint (the Habitat one-night format: lock the idea, build, ship, roast). " +
        "Call with no arguments first: the bunny will tell you what to ask the builder (solo, team, or event). " +
        "Then call again with mode and details. State lives in the local .habitat/ folder.",
      inputSchema: {
        mode: z
          .enum(["solo", "team", "event"])
          .optional()
          .describe("How the builder is sprinting. Omit to get the onboarding question."),
        idea: z.string().optional().describe("Rough idea, if the builder already has one."),
        hours: z
          .number()
          .min(0.5)
          .max(72)
          .optional()
          .describe("Sprint length in hours. Default 4 (one evening). Ignored when event_deadline is set."),
        team_name: z.string().optional().describe("Team name (team or event mode)."),
        team_members: z
          .array(z.string())
          .optional()
          .describe("First names of team members (team or event mode)."),
        event_name: z.string().optional().describe("Event or hackathon name (event mode)."),
        event_brief: z
          .string()
          .optional()
          .describe(
            "Event materials condensed by the host agent: theme, rules, submission requirements, judging criteria. Required for event mode.",
          ),
        event_deadline: z
          .string()
          .optional()
          .describe("Event submission deadline as ISO 8601 (with timezone if known)."),
        restart: z
          .boolean()
          .optional()
          .describe("Set true to abandon an existing active sprint and start fresh."),
      },
    },
    async (args) => {
      const existing = readState(cwd);
      if (existing && existing.status === "active" && !args.restart) {
        return text(
          `There is already a live sprint here (${existing.id}).\n\n${clockLine(existing)}\n\n` +
            `Current hop: ${hopLabel(existing.currentHop)}. Call sprint_status to continue it, ` +
            `or start_sprint with restart: true to abandon it and start fresh. ` +
            `The bunny votes for finishing. One hop at a time.`,
        );
      }

      if (!args.mode) {
        return text(
          `${BUNNY_PERSONA}\n\n${ONBOARDING_QUESTION}\n\n${agentContract()}`,
        );
      }

      if (args.mode === "event" && !args.event_brief) {
        return text(
          `Event mode needs the event materials before the clock starts.\n\n` +
            `Ask the builder for whatever exists: the brief, theme, rules, submission requirements, ` +
            `deadline, judging criteria. Read it yourself (pasted text, URL, PDF), condense it, ` +
            `then call start_sprint again with mode "event", event_brief, and event_deadline if stated.`,
        );
      }

      if (existing && existing.status === "active" && args.restart) {
        appendHistory(cwd, {
          id: existing.id,
          mode: existing.mode,
          date: existing.startedAt.slice(0, 10),
          startedAt: existing.startedAt,
          finishedAt: new Date().toISOString(),
          shipped: Boolean(existing.shipped),
          url: existing.shipped?.url,
          summary: existing.shipped?.summary,
          oneLiner: existing.idea?.oneLiner,
        });
      }

      const now = new Date();
      const hours = args.hours ?? 4;
      let endsAt = new Date(now.getTime() + hours * 3_600_000);
      let deadlineNote = "";
      if (args.event_deadline) {
        const parsed = new Date(args.event_deadline);
        if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > now.getTime()) {
          endsAt = parsed;
          deadlineNote = `The clock is set to the real event deadline: ${fmtClock(parsed.toISOString())}.`;
        } else {
          deadlineNote =
            "The event_deadline could not be parsed as a future ISO date, so the clock uses the hours window instead. Fix it by restarting if the real deadline matters.";
        }
      }

      const seed = args.event_name ?? args.team_name ?? args.idea ?? args.mode;
      const state: SprintState = {
        version: 1,
        id: `${now.toISOString().slice(0, 10)}-${slugify(seed)}`,
        mode: args.mode,
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        currentHop: "idea",
        hopDeadlines: scheduleHops(now, endsAt),
        parked: [],
        status: "active",
      };
      if (args.mode === "team" || (args.team_members && args.team_members.length > 0)) {
        state.team = {
          name: args.team_name,
          members: args.team_members ?? [],
        };
      }
      if (args.mode === "event") {
        state.event = {
          name: args.event_name,
          deadline: args.event_deadline,
        };
        writeEventBrief(
          cwd,
          `# Event brief: ${args.event_name ?? "event"}\n\n${args.event_brief ?? ""}`,
        );
      }
      writeState(cwd, state);

      const modeLine =
        args.mode === "solo"
          ? "Solo sprint. Just you, the agent, and the clock."
          : args.mode === "team"
            ? `Team sprint${state.team?.name ? ` for ${state.team.name}` : ""}${
                state.team?.members.length
                  ? ` (${state.team.members.join(", ")})`
                  : ""
              }. Split the hops, share the clock.`
            : `Event sprint${args.event_name ? ` at ${args.event_name}` : ""}. ` +
              `The brief is saved to .habitat/event.md and every gate now points at it.`;

      return text(
        [
          BUNNY_PERSONA,
          "",
          `Sprint ${state.id} is live. ${modeLine}`,
          deadlineNote,
          "",
          `The ritual, same as 200+ MVPs shipped at Habitat nights: ` +
            `Lock the idea, Build, Ship, Roast. Four hops, one clock.`,
          "",
          clockLine(state),
          "",
          `FIRST HOP: ${hopLabel("idea")} (deadline ${fmtClock(state.hopDeadlines.idea)}).`,
          "",
          FORGE_RULES,
          "",
          LENSES,
          "",
          IDEA_GATES,
          args.mode === "event"
            ? "\nEVENT GATE: the idea must fit the event theme and be submittable under the event rules in .habitat/event.md. Grill against the brief."
            : "",
          args.idea
            ? `\nThe builder arrived with: "${args.idea}". Start the grill on that. First question: which specific person has this problem, and in what moment?`
            : "\nAsk for the rough idea, then start the grill.",
          "",
          `When all gates pass, call lock_idea. Nothing gets built before the lock.`,
          "",
          agentContract(),
        ].join("\n"),
      );
    },
  );

  // ---- lock_idea -----------------------------------------------------------
  server.registerTool(
    "lock_idea",
    {
      title: "Lock the idea and open the build hop",
      description:
        "Locks the grilled idea (problem, ICP, one-liner, out-of-scope list) and opens the build hop. " +
        "Only call after the grill gates pass. The bunny rejects vague ICPs.",
      inputSchema: {
        idea: z.string().min(10).describe("The problem being solved: specific person, moment, pain."),
        icp: z
          .string()
          .describe("Target user, specific enough to find 10 of them this week."),
        one_liner: z
          .string()
          .describe("One sentence a non-technical friend can repeat. Names the ONE core feature."),
        out_of_scope: z
          .array(z.string())
          .describe("At least two things explicitly NOT being built tonight."),
      },
    },
    async (args) => {
      const state = readState(cwd);
      if (!state || state.status !== "active") return noSprint();
      if (state.idea) {
        return text(
          `The idea is already locked: "${state.idea.oneLiner}". No re-litigating mid-sprint. ` +
            `New directions go to check_scope; the backlog remembers. ${clockLine(state)}`,
        );
      }

      const icpTrimmed = args.icp.trim();
      const vague =
        icpTrimmed.length < 15 ||
        VAGUE_ICP.some((rx) => rx.test(icpTrimmed)) ||
        icpTrimmed.split(/\s+/).length < 3;
      if (vague) {
        return text(
          `Gate 2 failed: "${icpTrimmed}" is not an ICP, it is a crowd. ` +
            `The bunny needs a target user specific enough that the builder knows where to find 10 of them this week. ` +
            `Who exactly, doing what, in which moment? Re-grill and try lock_idea again.\n\n${FORGE_RULES}`,
        );
      }
      if (args.one_liner.trim().length > 220) {
        return text(
          `Gate 3 failed: the one-liner is ${args.one_liner.trim().length} characters. ` +
            `If a friend cannot repeat it back, it is not locked. Cut it to one clean sentence and call lock_idea again.`,
        );
      }
      if (args.out_of_scope.filter((s) => s.trim().length > 0).length < 2) {
        return text(
          `Gate 4 failed: fewer than two things declared out of scope. ` +
            `Scope creep is the number one reason people do not ship. Name at least two tempting things ` +
            `that are NOT being built tonight (auth, settings, admin, payments are the usual suspects), then lock again.`,
        );
      }

      state.idea = {
        idea: args.idea.trim(),
        icp: icpTrimmed,
        oneLiner: args.one_liner.trim(),
        outOfScope: args.out_of_scope.map((s) => s.trim()).filter(Boolean),
        lockedAt: new Date().toISOString(),
      };
      state.currentHop = "build";
      writeState(cwd, state);

      return text(
        [
          `Locked. "${state.idea.oneLiner}"`,
          `For: ${state.idea.icp}`,
          `Not tonight: ${state.idea.outOfScope.join("; ")}`,
          "",
          `${hopLabel("build")} is open (deadline ${fmtClock(state.hopDeadlines.build)}).`,
          "",
          clockLine(state),
          "",
          BUILD_RULES,
          "",
          `Now write the build prompt from the locked idea and start building. The bunny will keep the clock.`,
        ].join("\n"),
      );
    },
  );

  // ---- sprint_status -------------------------------------------------------
  server.registerTool(
    "sprint_status",
    {
      title: "Check the sprint clock and pace",
      description:
        "Time remaining, current hop, pace verdict, and the bunny's nudge. " +
        "Call at every natural checkpoint: task finished, conversation drifting, builder gone quiet.",
      inputSchema: {},
    },
    async () => {
      const state = readState(cwd);
      if (!state) return noSprint();
      if (state.status !== "active") {
        return text(
          `Last sprint (${state.id}) is ${state.status}. Call ship_log for the record, or start_sprint to go again.`,
        );
      }

      const report = pace(state);
      const lines: string[] = [clockLine(state), ""];
      lines.push(`Current hop: ${hopLabel(state.currentHop)}.`);
      if (state.idea) lines.push(`Locked one-liner: "${state.idea.oneLiner}".`);
      if (state.parked.length > 0) {
        lines.push(
          `Backlog: ${state.parked.length} parked idea${state.parked.length === 1 ? "" : "s"} (safe in .habitat/backlog.md).`,
        );
      }
      lines.push("");

      switch (state.currentHop) {
        case "idea":
          lines.push(
            report.hopRemainingMs < 0
              ? `The idea hop is over. Perfect ideas do not ship; lock the best version on the table with lock_idea, right now.`
              : `Keep grilling until the four gates pass, then lock_idea. Do not start building before the lock.`,
          );
          break;
        case "build":
          lines.push(
            report.hopRemainingMs < 0
              ? `Build time is up. Whatever exists now is the MVP. Call next_hop and get it to a URL.`
              : `Build only the locked one-liner. New feature ideas go through check_scope. ` +
                  `When the core flow works end to end, do not gold-plate it: move to next_hop early.`,
          );
          break;
        case "ship":
          lines.push(SHIP_CHECKLIST);
          break;
        case "roast":
          lines.push(`Shipped. One hop left: call roast for the honest read.`);
          break;
        case "done":
          lines.push(`Done. Call ship_log for the record and the share template.`);
          break;
      }

      if (report.verdict === "overtime" && state.currentHop !== "done") {
        lines.push(
          "",
          `Overtime rule: no new work. Publish whatever exists (ship), then roast. An imperfect URL beats a perfect plan.`,
        );
      }

      return text(lines.join("\n"));
    },
  );

  // ---- check_scope ---------------------------------------------------------
  server.registerTool(
    "check_scope",
    {
      title: "Scope gate: park a mid-sprint feature idea",
      description:
        "Call this yourself before writing any feature that is not the locked outcome. " +
        "The builder will not say check_scope. Parks the idea in the persistent backlog. " +
        "Works even when they are lost and nothing is locked yet.",
      inputSchema: {
        feature: z.string().min(3).describe("The new feature or direction that just came up."),
      },
    },
    async (args) => {
      const state = readState(cwd);
      if (state && state.status === "active" && !state.idea) {
        return text(
          `Nothing is locked yet, so there is no scope to protect. Finish the grill and lock_idea first. ` +
            `If "${args.feature}" is the actual idea, grill that one.`,
        );
      }

      parkFeature(cwd, args.feature);
      const daily = rollDailyIfNeeded(cwd).daily;
      const locked =
        state && state.status === "active" && state.idea
          ? state.idea.oneLiner
          : daily && daily.status === "active"
            ? daily.intent
            : null;

      return text(
        [
          `Parked: "${args.feature.trim()}". It is written down in .habitat/backlog.md, it will not be forgotten, and it is not happening today.`,
          "",
          locked
            ? `Today is exactly one sentence: "${locked}". Every minute on a side quest is a minute the ship does not get.`
            : `No hop is locked. Call today if you want a hop to protect, or keep parking until you do.`,
          "",
          state && state.status === "active" ? clockLine(state) : daily ? dailyClockLine(daily) : cadenceLine(cwd),
          "",
          `Back to the locked scope. One hop at a time.`,
        ].join("\n"),
      );
    },
  );

  // ---- next_hop ------------------------------------------------------------
  server.registerTool(
    "next_hop",
    {
      title: "Close the current hop and open the next",
      description:
        "Advances the ritual: idea -> build -> ship -> roast. The bunny refuses to skip gates " +
        "(no build before lock_idea, no roast before ship).",
      inputSchema: {},
    },
    async () => {
      const state = readState(cwd);
      if (!state || state.status !== "active") return noSprint();

      switch (state.currentHop) {
        case "idea":
          return text(
            `The idea hop closes through lock_idea, not next_hop. If the gates pass, lock it. ` +
              `If they do not, keep grilling. ${clockLine(state)}`,
          );
        case "build": {
          state.currentHop = "ship";
          writeState(cwd, state);
          return text(
            [
              `Build hop closed. ${hopLabel("ship")} is open (deadline ${fmtClock(state.hopDeadlines.ship)}).`,
              "",
              clockLine(state),
              "",
              SHIP_CHECKLIST,
              "",
              `Record the artifact with ship(url, summary) the moment it is live.`,
            ].join("\n"),
          );
        }
        case "ship":
          return text(
            state.shipped
              ? `Already shipped. Call roast for the last hop. ${clockLine(state)}`
              : `The ship hop closes through ship(url, summary), not next_hop. ` +
                  `No URL, no next hop. Deploy the smallest working thing and record it. ${clockLine(state)}`,
          );
        case "roast":
          return text(
            `The roast hop closes through the roast tool. Call roast and give the honest read. ${clockLine(state)}`,
          );
        case "done":
          return text(
            `The sprint is done. Call ship_log for the record, or start_sprint for the next one.`,
          );
      }
    },
  );

  // ---- ship ----------------------------------------------------------------
  server.registerTool(
    "ship",
    {
      title: "Record the shipped artifact",
      description:
        "Records the live URL and a one-sentence summary of what actually shipped. " +
        "Works on a daily hop or a sprint. localhost is refused. Writes the ship log.",
      inputSchema: {
        url: z.string().describe("The live, publicly clickable URL."),
        summary: z
          .string()
          .min(10)
          .describe("One sentence describing what shipped (what exists, not what was planned)."),
      },
    },
    async (args) => {
      const urlError = rejectShipUrl(args.url);
      if (urlError) return text(urlError);

      const state = readState(cwd);
      if (state && state.status === "active") {
        if (!state.idea) {
          return text(
            `Shipping before locking is just publishing a guess. Grill, lock_idea, then build, then ship.`,
          );
        }
        if (state.shipped) {
          return text(
            `Already shipped: ${state.shipped.url}. One artifact per sprint. Call roast to finish.`,
          );
        }

        state.shipped = {
          url: args.url,
          summary: args.summary.trim(),
          at: new Date().toISOString(),
        };
        state.currentHop = "roast";
        writeState(cwd, state);

        const eventBrief = state.mode === "event" ? readEventBrief(cwd) : null;
        const durationMs =
          new Date(state.shipped.at).getTime() - new Date(state.startedAt).getTime();

        appendShipLog(
          cwd,
          [
            `## ${state.id}`,
            "",
            `- Shipped: ${state.shipped.summary}`,
            `- URL: ${state.shipped.url}`,
            `- One-liner: ${state.idea.oneLiner}`,
            `- Mode: ${state.mode}${state.event?.name ? ` (${state.event.name})` : ""}`,
            `- Time from start to ship: ${fmtDuration(durationMs)}`,
            `- Parked along the way: ${state.parked.length}`,
            "",
            shareTemplate(state),
          ].join("\n"),
        );

        return text(
          [
            `SHIPPED. ${fmtDuration(durationMs)} from start to a live URL. That is the whole point of the ritual.`,
            "",
            `Logged to .habitat/ships.md.`,
            "",
            eventBrief
              ? `EVENT CHECK before the deadline: re-read the brief in .habitat/event.md and verify every ` +
                `submission requirement is met (form submitted, repo linked, demo video, whatever the rules say). ` +
                `A great build that misses a requirement scores zero.\n`
              : "",
            `One hop left: call roast. The honest read is where the learning lives.`,
            "",
            clockLine(state),
          ].join("\n"),
        );
      }

      const now = new Date();
      const burrow = rollDailyIfNeeded(cwd, now);
      if (burrow.daily?.status === "shipped") {
        return text(
          `Already shipped today: ${burrow.daily.shipped?.url}. One hop a day. Call roast or wait until tomorrow.`,
        );
      }
      const daily: DailyHop = burrow.daily ?? {
        date: todayKey(now),
        intent: args.summary.trim(),
        outOfScope: [],
        startedAt: now.toISOString(),
        endsAt: endOfLocalDay(now).toISOString(),
        status: "active",
      };
      recordDailyShip(cwd, daily, args.url, args.summary, now);
      const durationMs = now.getTime() - new Date(daily.startedAt).getTime();
      return text(
        [
          `SHIPPED. ${fmtDuration(durationMs)} from hop to a live URL.`,
          "",
          `Logged to .habitat/ships.md.`,
          cadenceLine(cwd),
          "",
          `Optional last hop: call roast for the honest read.`,
          "",
          shareTemplateDaily(daily),
        ].join("\n"),
      );
    },
  );

  // ---- roast ---------------------------------------------------------------
  server.registerTool(
    "roast",
    {
      title: "Run the post-ship roast",
      description:
        "Returns the Habitat roast rubric for the host model to execute against the shipped artifact " +
        "(and the event judging criteria in event mode). Works after a daily ship or a sprint ship.",
      inputSchema: {},
    },
    async () => {
      const state = readState(cwd);
      if (state && state.status === "active") {
        if (!state.shipped || !state.idea) {
          return text(
            `Nothing to roast yet. The roast only happens to things that exist at a URL. Ship first.`,
          );
        }

      state.roastedAt = new Date().toISOString();
      state.status = "done";
      state.currentHop = "done";
      writeState(cwd, state);
      appendHistory(cwd, {
        id: state.id,
        mode: state.mode,
        date: todayKey(),
        startedAt: state.startedAt,
        finishedAt: state.roastedAt,
        shipped: true,
        url: state.shipped.url,
        summary: state.shipped.summary,
        oneLiner: state.idea.oneLiner,
      });

      const eventBrief = state.mode === "event" ? readEventBrief(cwd) : null;

      return text(
        [
          ROAST_RUBRIC,
          "",
          eventBrief ? `${EVENT_ROAST_ADDENDUM}\n\n--- EVENT BRIEF ---\n${eventBrief}\n---\n` : "",
          `CONTEXT FOR THE ROAST:`,
          `- Locked idea: ${state.idea.idea}`,
          `- ICP: ${state.idea.icp}`,
          `- One-liner: ${state.idea.oneLiner}`,
          `- Shipped: ${state.shipped.summary}`,
          `- URL: ${state.shipped.url}`,
          `- Parked mid-sprint: ${
            state.parked.length > 0
              ? state.parked.map((p) => p.feature).join("; ")
              : "nothing"
          }`,
          "",
          `After delivering the roast, close with the ship log:`,
          "",
          shareTemplate(state),
          "",
          `The sprint is closed. ${SITE_URL} and ${COMMUNITY_URL} for the next Habitat night.`,
        ].join("\n"),
      );
      }

      const daily = rollDailyIfNeeded(cwd).daily;
      if (!daily?.shipped) {
        return text(
          `Nothing to roast yet. The roast only happens to things that exist at a URL. Ship first, or call today and ship today's hop.`,
        );
      }

      return text(
        [
          ROAST_RUBRIC,
          "",
          `CONTEXT FOR THE ROAST:`,
          `- Today's hop: ${daily.intent}`,
          `- Not today: ${daily.outOfScope.join("; ") || "nothing named"}`,
          `- Shipped: ${daily.shipped.summary}`,
          `- URL: ${daily.shipped.url}`,
          `- Parked: ${
            readBurrow(cwd).parked.length > 0
              ? readBurrow(cwd).parked.map((item) => item.feature).join("; ")
              : "nothing"
          }`,
          "",
          `After delivering the roast, close with the ship log:`,
          "",
          shareTemplateDaily(daily),
          "",
          cadenceLine(cwd),
          `Tomorrow, call today again. ${SITE_URL} if they want a room.`,
        ].join("\n"),
      );
    },
  );

  // ---- ship_log ------------------------------------------------------------
  server.registerTool(
    "ship_log",
    {
      title: "Read the ship log",
      description:
        "Daily hops and sprints that made it to a URL, plus this week's count and the ship streak.",
      inputSchema: {},
    },
    async () => {
      const state = readState(cwd);
      const daily = rollDailyIfNeeded(cwd).daily;
      const history = readHistory(cwd);
      const shippedRuns = history.filter((entry) => entry.shipped);
      const current =
        state && state.status === "active"
          ? `\nLive right now: sprint ${state.id}, ${hopLabel(state.currentHop)}. ${clockLine(state)}`
          : daily && daily.status === "active"
            ? `\nLive right now: today's hop. ${dailyClockLine(daily)}`
            : "";

      if (shippedRuns.length === 0 && !state?.shipped && !daily?.shipped) {
        return text(
          `The ship log is empty. Zero ships so far in this burrow.${current}\n\n` +
            `Fix that: call today. ${COMMUNITY_URL} if the builder wants to ship with other humans in the room.`,
        );
      }

      const lines: string[] = [
        `Ship log: ${shippedRuns.length} shipped hop${shippedRuns.length === 1 ? "" : "s"} in this folder.`,
        cadenceLine(cwd),
        "",
      ];
      for (const run of shippedRuns.slice(-10)) {
        lines.push(
          `- ${run.finishedAt.slice(0, 10)} · ${run.mode}: ${run.summary ?? run.oneLiner ?? run.id} (${run.url ?? "no url"})`,
        );
      }
      const last = shippedRuns[shippedRuns.length - 1];
      if (state?.shipped) {
        lines.push("", shareTemplate(state));
      } else if (daily?.shipped) {
        lines.push("", shareTemplateDaily(daily));
      } else if (last?.url) {
        lines.push(
          "",
          `Latest ship: ${last.url}. Full log with share templates lives in .habitat/ships.md.`,
        );
      }
      if (current) lines.push(current);
      lines.push("", `Next hop: call today. A Habitat night is still one start_sprint away.`);
      return text(lines.join("\n"));
    },
  );

  return server;
}
