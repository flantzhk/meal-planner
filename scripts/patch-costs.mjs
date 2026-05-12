#!/usr/bin/env node
// Patch estimated_cost_hkd on all live recipes without overwriting other fields.
//
// Usage:
//   export MP_FAITH_TOKEN="<your token from browser localStorage → mpFaithToken>"
//   node scripts/patch-costs.mjs
//
// What it does:
//   1. Fetches current recipes from KV (preserves any in-app edits)
//   2. Reads cost values from recipes.seed.json (updated by calc_costs3.py)
//   3. Applies only estimated_cost_hkd from seed → live recipes
//   4. Pushes the merged array back to KV

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.env.MP_API_BASE || "https://meal-planner-api.faith-lantz-ee8.workers.dev";
const token = process.env.MP_FAITH_TOKEN;
if (!token) {
  console.error("Set MP_FAITH_TOKEN. Find it in browser DevTools → Application → Local Storage → mpFaithToken");
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(scriptDir, "../recipes.seed.json");
const seedRecipes = JSON.parse(fs.readFileSync(seedPath, "utf8"));

// Build a cost lookup from the updated seed file
const costBySeedId = {};
for (const r of seedRecipes) {
  if (r.estimated_cost_hkd != null) {
    costBySeedId[r.id] = r.estimated_cost_hkd;
  }
}

// Fetch live recipes
console.log("Fetching live recipes from KV…");
const getRes = await fetch(`${base}/recipes`);
if (!getRes.ok) {
  console.error("GET /recipes failed:", getRes.status, await getRes.text());
  process.exit(1);
}
const liveRecipes = await getRes.json();
console.log(`  Got ${liveRecipes.length} live recipes`);

// Patch costs
let changed = 0;
const patched = liveRecipes.map((r) => {
  const newCost = costBySeedId[r.id];
  if (newCost != null && r.estimated_cost_hkd !== newCost) {
    changed++;
    return { ...r, estimated_cost_hkd: newCost };
  }
  return r;
});

console.log(`  Patching ${changed} recipes with new costs`);

// Push back
const putRes = await fetch(`${base}/recipes`, {
  method: "PUT",
  headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
  body: JSON.stringify(patched),
});

if (!putRes.ok) {
  console.error("PUT /recipes failed:", putRes.status, await putRes.text());
  process.exit(1);
}

const result = await putRes.json();
console.log(`Done — ${result.count} recipes live with updated costs.`);
