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
