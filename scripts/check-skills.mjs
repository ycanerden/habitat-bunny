#!/usr/bin/env node
// Fail if a promoted skill is missing from the catalog contract.
// Promoted buckets: sprint/, daily/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const promoted = ["sprint", "daily"];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function skillDirs(bucket) {
  const dir = path.join(root, "skills", bucket);
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
const pluginSkills = new Set(plugin.skills);
const readme = read("README.md");
const errors = [];

const siblingManifests = [
  ".cursor-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".grok-plugin/plugin.json",
];

function skillSet(value) {
  if (!Array.isArray(value)) return null;
  return new Set(value);
}

for (const rel of siblingManifests) {
  if (!exists(rel)) {
    errors.push(`missing ${rel}`);
    continue;
  }
  const manifest = JSON.parse(read(rel));
  const skills = skillSet(manifest.skills);
  if (!skills) {
    errors.push(`${rel} skills must be an array of promoted skill paths`);
    continue;
  }
  for (const s of pluginSkills) {
    if (!skills.has(s)) errors.push(`${rel} missing ${s}`);
  }
  for (const s of skills) {
    if (!pluginSkills.has(s)) errors.push(`${rel} extra skill ${s}`);
  }
}

if (!exists(".mcp.json")) {
  errors.push("missing .mcp.json");
} else {
  const mcp = JSON.parse(read(".mcp.json"));
  const server = mcp?.mcpServers?.["habitat-bunny"];
  const args = server?.args;
  if (server?.command !== "npx" || !Array.isArray(args) || !args.includes("habitat-bunny")) {
    errors.push(".mcp.json must run npx habitat-bunny");
  }
}

if (!exists("assets/logo.svg")) {
  errors.push("missing assets/logo.svg");
}

if (!exists(".agents/plugins/marketplace.json")) {
  errors.push("missing .agents/plugins/marketplace.json");
} else {
  const agentsMarket = JSON.parse(read(".agents/plugins/marketplace.json"));
  const names = (agentsMarket.plugins ?? []).map((p) => p.name);
  if (!names.includes("habitat-bunny")) {
    errors.push(".agents/plugins/marketplace.json missing habitat-bunny");
  }
}

for (const bucket of promoted) {
  const bucketReadme = read(`skills/${bucket}/README.md`);
  for (const name of skillDirs(bucket)) {
    const rel = `skills/${bucket}/${name}`;
    const skillMd = `${rel}/SKILL.md`;
    const yaml = `${rel}/agents/openai.yaml`;
    const docs = `docs/${bucket}/${name}.md`;
    if (!exists(skillMd)) errors.push(`missing ${skillMd}`);
    if (!exists(yaml)) errors.push(`missing ${yaml}`);
    if (!exists(docs)) errors.push(`missing ${docs}`);
    if (!pluginSkills.has(`./${rel}`)) {
      errors.push(`plugin.json missing ./${rel}`);
    }
    if (!readme.includes(`./${skillMd}`)) {
      errors.push(`README.md does not link ${skillMd}`);
    }
    if (!bucketReadme.includes(`./${name}/SKILL.md`)) {
      errors.push(`skills/${bucket}/README.md does not link ${name}`);
    }

    if (exists(skillMd)) {
      const body = read(skillMd);
      const front = body.split("---")[1] ?? "";
      if (!front.includes(`name: ${name}`)) {
        errors.push(`${skillMd} frontmatter name must be ${name}`);
      }
      const userInvoked = front.includes("disable-model-invocation: true");
      if (exists(yaml)) {
        const y = read(yaml);
        const blocked = y.includes("allow_implicit_invocation: false");
        if (userInvoked !== blocked) {
          errors.push(
            `${name}: disable-model-invocation and openai.yaml policy must match`,
          );
        }
      }
    }
  }
}

const leftover = [...pluginSkills].filter((s) => {
  const parts = s.replace(/^\.\//, "").split("/");
  return parts[0] === "skills" && !promoted.includes(parts[1] ?? "");
});
for (const s of leftover) {
  errors.push(`plugin.json lists non-promoted skill ${s}`);
}

if (errors.length > 0) {
  console.error("check-skills failed:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("SKILLS OK");
