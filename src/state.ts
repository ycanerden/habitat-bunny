// Sprint state machine + local persistence. Everything lives in a .habitat/
// folder in the current working directory: machine state as JSON, plus
// human-readable markdown mirrors (sprint.md, backlog.md, ships.md, event.md)
// so the builder, and any other agent on the same machine, can read the state
// without the MCP server.

import fs from "node:fs";
import path from "node:path";

export type Hop = "idea" | "build" | "ship" | "roast" | "done";
export type Mode = "solo" | "team" | "event";

export interface ParkedFeature {
  feature: string;
  at: string;
}

export interface SprintState {
  version: 1;
  id: string;
  mode: Mode;
  startedAt: string;
  endsAt: string;
  currentHop: Hop;
  hopDeadlines: Record<Exclude<Hop, "done">, string>;
  team?: { name?: string; members: string[] };
  event?: { name?: string; deadline?: string };
  idea?: {
    idea: string;
    icp: string;
    oneLiner: string;
    outOfScope: string[];
    lockedAt: string;
  };
  parked: ParkedFeature[];
  shipped?: { url: string; summary: string; at: string };
  roastedAt?: string;
  status: "active" | "done" | "abandoned";
}

export interface SprintHistoryEntry {
  id: string;
  mode: Mode;
  startedAt: string;
  finishedAt: string;
  shipped: boolean;
  url?: string;
  summary?: string;
  oneLiner?: string;
}

export const HABITAT_DIR = ".habitat";

const HOP_ORDER: Hop[] = ["idea", "build", "ship", "roast", "done"];

const MIN = 60_000;

function dir(cwd: string): string {
  return path.join(cwd, HABITAT_DIR);
}

function file(cwd: string, name: string): string {
  return path.join(dir(cwd), name);
}

export function ensureDir(cwd: string): void {
  fs.mkdirSync(dir(cwd), { recursive: true });
}

export function readState(cwd: string): SprintState | null {
  const p = file(cwd, "state.json");
  if (!fs.existsSync(p)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as SprintState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function writeState(cwd: string, state: SprintState): void {
  ensureDir(cwd);
  fs.writeFileSync(file(cwd, "state.json"), JSON.stringify(state, null, 2));
  fs.writeFileSync(file(cwd, "sprint.md"), renderSprintMd(state));
  fs.writeFileSync(file(cwd, "backlog.md"), renderBacklogMd(state));
}

export function writeEventBrief(cwd: string, brief: string): void {
  ensureDir(cwd);
  fs.writeFileSync(file(cwd, "event.md"), brief.trim() + "\n");
}

export function readEventBrief(cwd: string): string | null {
  const p = file(cwd, "event.md");
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8").trim() : null;
}

export function appendShipLog(cwd: string, entryMd: string): void {
  ensureDir(cwd);
  const p = file(cwd, "ships.md");
  const existing = fs.existsSync(p)
    ? fs.readFileSync(p, "utf8")
    : "# Habitat ship log\n\nEvery sprint that made it to a URL.\n";
  fs.writeFileSync(p, existing.trimEnd() + "\n\n" + entryMd.trim() + "\n");
}

export function readHistory(cwd: string): SprintHistoryEntry[] {
  const p = file(cwd, "history.json");
  if (!fs.existsSync(p)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
    return Array.isArray(parsed) ? (parsed as SprintHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(cwd: string, entry: SprintHistoryEntry): void {
  ensureDir(cwd);
  const history = readHistory(cwd);
  history.push(entry);
  fs.writeFileSync(file(cwd, "history.json"), JSON.stringify(history, null, 2));
}

export function clearState(cwd: string): void {
  const p = file(cwd, "state.json");
  if (fs.existsSync(p)) fs.rmSync(p);
  const sprintMd = file(cwd, "sprint.md");
  if (fs.existsSync(sprintMd)) fs.rmSync(sprintMd);
}

// ---- scheduling ----------------------------------------------------------

/**
 * Split the total sprint window into hop deadlines.
 * Idea 15% (10-45 min), ship reserve 15% (15-60 min), roast reserve 10%
 * (10-30 min), build gets the remainder. Mirrors the pacing that worked at
 * Habitat live events.
 */
export function scheduleHops(
  start: Date,
  end: Date,
): Record<Exclude<Hop, "done">, string> {
  const total = Math.max(end.getTime() - start.getTime(), 30 * MIN);
  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), hi);
  const ideaMs = clamp(total * 0.15, 10 * MIN, 45 * MIN);
  const shipMs = clamp(total * 0.15, 15 * MIN, 60 * MIN);
  const roastMs = clamp(total * 0.1, 10 * MIN, 30 * MIN);
  const endMs = start.getTime() + total;
  return {
    idea: new Date(start.getTime() + ideaMs).toISOString(),
    build: new Date(endMs - shipMs - roastMs).toISOString(),
    ship: new Date(endMs - roastMs).toISOString(),
    roast: new Date(endMs).toISOString(),
  };
}

export function nextHopOf(hop: Hop): Hop {
  const idx = HOP_ORDER.indexOf(hop);
  return HOP_ORDER[Math.min(idx + 1, HOP_ORDER.length - 1)] ?? "done";
}

export function hopLabel(hop: Hop): string {
  const labels: Record<Hop, string> = {
    idea: "Hop 1 of 4: Lock the idea",
    build: "Hop 2 of 4: Build",
    ship: "Hop 3 of 4: Ship",
    roast: "Hop 4 of 4: Roast",
    done: "Done",
  };
  return labels[hop];
}

// ---- time formatting ------------------------------------------------------

export function fmtDuration(ms: number): string {
  const negative = ms < 0;
  const abs = Math.abs(ms);
  const totalMinutes = Math.round(abs / MIN);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const body = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return negative ? `${body} over` : body;
}

export function fmtClock(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export interface PaceReport {
  now: Date;
  overallRemainingMs: number;
  hopRemainingMs: number;
  verdict: "on pace" | "behind" | "overtime";
}

export function pace(state: SprintState, now = new Date()): PaceReport {
  const endsAt = new Date(state.endsAt).getTime();
  const overallRemainingMs = endsAt - now.getTime();
  const hopDeadline =
    state.currentHop === "done"
      ? endsAt
      : new Date(state.hopDeadlines[state.currentHop]).getTime();
  const hopRemainingMs = hopDeadline - now.getTime();
  let verdict: PaceReport["verdict"] = "on pace";
  if (overallRemainingMs < 0) verdict = "overtime";
  else if (hopRemainingMs < 0) verdict = "behind";
  return { now, overallRemainingMs, hopRemainingMs, verdict };
}

// ---- markdown mirrors ------------------------------------------------------

function renderSprintMd(state: SprintState): string {
  const lines: string[] = [
    `# Habitat sprint: ${state.id}`,
    "",
    `- Mode: ${state.mode}`,
    `- Status: ${state.status}`,
    `- Current hop: ${hopLabel(state.currentHop)}`,
    `- Started: ${fmtClock(state.startedAt)}`,
    `- Ends: ${fmtClock(state.endsAt)}`,
  ];
  if (state.team) {
    lines.push(
      `- Team: ${state.team.name ?? "unnamed"} (${state.team.members.join(", ")})`,
    );
  }
  if (state.event) {
    lines.push(
      `- Event: ${state.event.name ?? "see event.md"}${
        state.event.deadline
          ? `, submission deadline ${fmtClock(state.event.deadline)}`
          : ""
      }`,
    );
  }
  lines.push("", "## Hop deadlines", "");
  for (const hop of ["idea", "build", "ship", "roast"] as const) {
    lines.push(`- ${hopLabel(hop)}: ${fmtClock(state.hopDeadlines[hop])}`);
  }
  if (state.idea) {
    lines.push(
      "",
      "## Locked idea",
      "",
      `- Idea: ${state.idea.idea}`,
      `- ICP: ${state.idea.icp}`,
      `- One-liner: ${state.idea.oneLiner}`,
      `- Out of scope tonight: ${state.idea.outOfScope.join("; ")}`,
      `- Locked at: ${fmtClock(state.idea.lockedAt)}`,
    );
  }
  if (state.shipped) {
    lines.push(
      "",
      "## Shipped",
      "",
      `- URL: ${state.shipped.url}`,
      `- Summary: ${state.shipped.summary}`,
      `- At: ${fmtClock(state.shipped.at)}`,
    );
  }
  return lines.join("\n") + "\n";
}

function renderBacklogMd(state: SprintState): string {
  const lines = [
    "# Habitat backlog",
    "",
    "Ideas the bunny parked so the sprint could stay on one hop. Revisit tomorrow, not tonight.",
    "",
  ];
  if (state.parked.length === 0) {
    lines.push("(empty so far)");
  } else {
    for (const item of state.parked) {
      lines.push(`- [ ] ${item.feature} (parked ${fmtClock(item.at)})`);
    }
  }
  return lines.join("\n") + "\n";
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "sprint";
}
