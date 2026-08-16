// End-to-end smoke test: spins up the built server over stdio in a temp dir
// and walks the full ritual: onboarding -> start -> grill gates -> lock ->
// scope gate -> ship gates -> roast -> ship log. Exits non-zero on failure.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverEntry = path.join(pkgDir, "dist", "index.js");
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "habitat-smoke-"));

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverEntry],
  cwd: workDir,
});
const client = new Client({ name: "smoke", version: "0.0.0" });
await client.connect(transport);

async function call(name, args = {}) {
  const result = await client.callTool({ name, arguments: args });
  const text = result.content?.map((c) => c.text).join("\n") ?? "";
  console.log(`\n=== ${name} ===\n${text.slice(0, 400)}${text.length > 400 ? "\n[...]" : ""}`);
  return text;
}

// 1. Tool inventory
const tools = await client.listTools();
const names = tools.tools.map((t) => t.name).sort();
assert.deepStrictEqual(
  names,
  [
    "check_scope",
    "lock_idea",
    "next_hop",
    "roast",
    "ship",
    "ship_log",
    "sprint_status",
    "start_sprint",
    "today",
  ],
  `unexpected tool list: ${names.join(", ")}`,
);
console.log(`tools: ${names.join(", ")}`);

// 2. Lost in the editor: no magic phrase, grill starts
const emptyDay = await call("today");
assert.match(emptyDay, /GRILL RULES/);
assert.match(emptyDay, /opened the editor/i);
assert.match(emptyDay, /Do not ask them to name a hop/);

// 2b. Ramble from a lost builder is cited, not turned into a form
const lost = await call("today", {
  ramble: "I'm building something, not sure what it is, just adding features",
});
assert.match(lost, /GRILL RULES/);
assert.match(lost, /adding features/);
assert.match(lost, /They are building and they are not sure/);
assert.ok(fs.existsSync(path.join(workDir, ".habitat", "today.md")), "today.md missing after ramble");
assert.match(fs.readFileSync(path.join(workDir, ".habitat", "today.md"), "utf8"), /adding features/);

// 3. Vague daily intent is rejected
assert.match(
  await call("today", { intent: "work on the app", out_of_scope: ["auth"] }),
  /Gate 1 failed/,
);

// 4. Daily lock requires out of scope
assert.match(
  await call("today", {
    intent: "Ship a public page where a Leuven student pastes a schedule and gets a grocery list.",
  }),
  /Gate 2 failed/,
);

// 5. Daily hop locks, parks, ships, roasts
const lockedDay = await call("today", {
  intent: "Ship a public page where a Leuven student pastes a schedule and gets a grocery list.",
  out_of_scope: ["auth"],
  hours: 2,
});
assert.match(lockedDay, /Locked for /);
assert.ok(fs.existsSync(path.join(workDir, ".habitat", "today.md")), "today.md missing");
assert.ok(fs.existsSync(path.join(workDir, ".habitat", "burrow.json")), "burrow.json missing");

const dailyParked = await call("check_scope", { feature: "dark mode toggle" });
assert.match(dailyParked, /Parked/);
assert.match(fs.readFileSync(path.join(workDir, ".habitat", "backlog.md"), "utf8"), /dark mode/);

assert.match(
  await call("ship", { url: "http://localhost:3000", summary: "daily meal planner is live" }),
  /localhost is not shipped/,
);
const dailyShipped = await call("ship", {
  url: "https://daily-hop.vercel.app",
  summary: "Public schedule-to-grocery page is live.",
});
assert.match(dailyShipped, /SHIPPED/);
assert.match(await call("roast"), /ROAST INSTRUCTIONS/);
assert.match(await call("ship_log"), /1 shipped hop/);

// 6. Onboarding question when no mode given
const onboarding = await call("start_sprint");
assert.match(onboarding, /solo, with a team, or/i);

// 7. Status with no sprint
assert.match(await call("sprint_status"), /No active sprint/);

// 8. Event mode requires a brief
assert.match(await call("start_sprint", { mode: "event" }), /needs the event materials/i);

// 9. Start an event sprint with brief and deadline
const deadline = new Date(Date.now() + 3 * 3600_000).toISOString();
const started = await call("start_sprint", {
  mode: "event",
  event_name: "AI Startup Night",
  event_brief: "Theme: AI for everyday life. Submit a live URL plus one-line summary. Judging: idea, product, potential.",
  event_deadline: deadline,
  idea: "help students cook cheap meals",
});
assert.match(started, /Sprint .* is live/);
assert.match(started, /GRILL RULES/);
assert.match(started, /EVENT GATE/);
assert.ok(fs.existsSync(path.join(workDir, ".habitat", "event.md")), "event.md missing");

// 10. Double start is refused
assert.match(await call("start_sprint", { mode: "solo" }), /already a live sprint/i);

// 11. Vague ICP is rejected
assert.match(
  await call("lock_idea", {
    idea: "students waste money on food delivery every week",
    icp: "students",
    one_liner: "A meal planner",
    out_of_scope: ["auth", "payments"],
  }),
  /Gate 2 failed/,
);

// 12. Too few out-of-scope items rejected
assert.match(
  await call("lock_idea", {
    idea: "students waste money on food delivery every week",
    icp: "first-year exchange students in Leuven who order delivery 3+ times a week",
    one_liner: "Paste your week's schedule, get a 5-meal plan with one grocery list under 30 euros.",
    out_of_scope: ["auth"],
  }),
  /Gate 4 failed/,
);

// 13. Proper lock advances to build
const locked = await call("lock_idea", {
  idea: "students waste money on food delivery every week",
  icp: "first-year exchange students in Leuven who order delivery 3+ times a week",
  one_liner: "Paste your week's schedule, get a 5-meal plan with one grocery list under 30 euros.",
  out_of_scope: ["auth", "payments", "meal photos"],
});
assert.match(locked, /Locked\./);
assert.match(locked, /BUILD HOP RULES/);

// 14. Scope gate parks features and keeps the daily backlog
const parked = await call("check_scope", { feature: "AI chatbot that suggests wine pairings" });
assert.match(parked, /Parked/);
const backlog = fs.readFileSync(path.join(workDir, ".habitat", "backlog.md"), "utf8");
assert.match(backlog, /wine pairings/);
assert.match(backlog, /dark mode/);

// 15. Can't ship from ship-hop shortcut without URL; advance then gate localhost
assert.match(await call("next_hop"), /Ship.*is open|SHIP HOP CHECKLIST/s);
assert.match(await call("ship", { url: "http://localhost:3000", summary: "meal planner mvp with grocery list" }), /localhost is not shipped/);
assert.match(await call("ship", { url: "not-a-url", summary: "meal planner mvp with grocery list" }), /not a URL/);

// 16. Real ship works, logs, and points at event requirements
const shippedOut = await call("ship", {
  url: "https://meal-hop.vercel.app",
  summary: "Live meal planner: paste schedule, get 5 meals and one grocery list.",
});
assert.match(shippedOut, /SHIPPED/);
assert.match(shippedOut, /EVENT CHECK/);
assert.ok(fs.readFileSync(path.join(workDir, ".habitat", "ships.md"), "utf8").includes("meal-hop.vercel.app"));

// 17. Roast returns rubric with event addendum and closes the sprint
const roast = await call("roast");
assert.match(roast, /ROAST INSTRUCTIONS/);
assert.match(roast, /EVENT MODE ADDENDUM/);
assert.match(roast, /Share template/);

// 18. Ship log records the daily hop and the sprint
const log = await call("ship_log");
assert.match(log, /2 shipped hop/);
assert.match(log, /daily/);

// 19. A new sprint can start after the old one is done
assert.match(await call("start_sprint", { mode: "solo", hours: 2 }), /Sprint .* is live/);

// 20. State files are human-readable markdown
const sprintMd = fs.readFileSync(path.join(workDir, ".habitat", "sprint.md"), "utf8");
assert.match(sprintMd, /# Habitat sprint/);

await client.close();
console.log(`\nSMOKE OK (state in ${workDir})`);
