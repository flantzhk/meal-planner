// meal-planner-api — Cloudflare Worker
// Storage: KV namespace MEAL_DATA
// Keys:
//   recipes                     → array of recipe objects
//   weekplan:current            → current week plan
//   weekplan:archive:YYYY-MM-DD → archived week plans, keyed by week_start
//   eaten-log                   → { [recipe_id]: ["YYYY-MM-DD", ...] }
//   feedback:YYYY-WW            → array of feedback entries for ISO week

const JSON_HEADERS = { "content-type": "application/json" };

function cors(origin) {
  return {
    "access-control-allow-origin": origin || "*",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
  };
}

function json(data, init = {}, origin = "*") {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...JSON_HEADERS, ...cors(origin), ...(init.headers || {}) },
  });
}

function err(status, message, origin = "*") {
  return json({ error: message }, { status }, origin);
}

function requireAuth(request, env) {
  const h = request.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!env.FAITH_TOKEN) return "server-misconfigured: FAITH_TOKEN not set";
  if (!token) return "missing bearer token";
  if (token !== env.FAITH_TOKEN) return "bad token";
  return null;
}

// ---------- recipes ----------

async function getRecipes(env) {
  const raw = await env.MEAL_DATA.get("recipes");
  return raw ? JSON.parse(raw) : [];
}

async function putRecipes(env, recipes) {
  await env.MEAL_DATA.put("recipes", JSON.stringify(recipes));
}

async function upsertRecipe(env, id, recipe) {
  const recipes = await getRecipes(env);
  const i = recipes.findIndex((r) => r.id === id);
  if (i >= 0) recipes[i] = { ...recipes[i], ...recipe, id };
  else recipes.push({ ...recipe, id });
  await putRecipes(env, recipes);
  return recipes.find((r) => r.id === id);
}

async function deleteRecipe(env, id) {
  const recipes = await getRecipes(env);
  await putRecipes(env, recipes.filter((r) => r.id !== id));
}

// ---------- weekplan ----------

async function getWeekplan(env) {
  const raw = await env.MEAL_DATA.get("weekplan:current");
  return raw ? JSON.parse(raw) : null;
}

async function putWeekplan(env, plan) {
  // Archive the previous current weekplan if its week_start differs.
  const prevRaw = await env.MEAL_DATA.get("weekplan:current");
  if (prevRaw) {
    const prev = JSON.parse(prevRaw);
    if (prev.week_start && prev.week_start !== plan.week_start) {
      await env.MEAL_DATA.put(`weekplan:archive:${prev.week_start}`, prevRaw);
    }
  }
  await env.MEAL_DATA.put("weekplan:current", JSON.stringify(plan));

  // Also write the plan's meals into the eaten-log so "last eaten" is up to date.
  const log = await getEatenLog(env);
  for (const day of plan.days || []) {
    for (const meal of ["breakfast", "lunch", "dinner"]) {
      const id = day[meal];
      if (!id) continue;
      log[id] = log[id] || [];
      if (!log[id].includes(day.date)) log[id].push(day.date);
    }
  }
  await env.MEAL_DATA.put("eaten-log", JSON.stringify(log));
}

// ---------- eaten-log ----------

async function getEatenLog(env) {
  const raw = await env.MEAL_DATA.get("eaten-log");
  return raw ? JSON.parse(raw) : {};
}

async function recordEaten(env, recipeId, date) {
  const log = await getEatenLog(env);
  log[recipeId] = log[recipeId] || [];
  if (!log[recipeId].includes(date)) log[recipeId].push(date);
  await env.MEAL_DATA.put("eaten-log", JSON.stringify(log));
  return log;
}

// ---------- feedback ----------

function isoWeekKey(dateStr) {
  // ISO week: YYYY-Www (e.g. 2026-W17)
  const d = new Date(dateStr + "T12:00:00Z");
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThu = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNum = 1 + Math.round(((target - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

async function appendFeedback(env, entry) {
  const key = `feedback:${isoWeekKey(entry.date)}`;
  const raw = await env.MEAL_DATA.get(key);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push({ ...entry, _ts: new Date().toISOString() });
  await env.MEAL_DATA.put(key, JSON.stringify(arr));
  return { key, count: arr.length };
}

async function getFeedbackForWeek(env, dateStr) {
  const key = `feedback:${isoWeekKey(dateStr)}`;
  const raw = await env.MEAL_DATA.get(key);
  return raw ? JSON.parse(raw) : [];
}

// ---------- pantry ----------
// Items the helper has confirmed are already in the house.
// Stored as { "<item lowercased>": "YYYY-MM-DD" } — date last confirmed.
// Writes are unauthenticated (same trust model as feedback) because the
// helper needs to toggle them and she doesn't have the Faith token.

async function getPantry(env) {
  const raw = await env.MEAL_DATA.get("pantry");
  return raw ? JSON.parse(raw) : {};
}

async function togglePantry(env, item, have) {
  const pantry = await getPantry(env);
  const key = String(item || "").toLowerCase().trim();
  if (!key) throw new Error("item required");
  if (have) pantry[key] = new Date().toISOString().slice(0, 10);
  else delete pantry[key];
  await env.MEAL_DATA.put("pantry", JSON.stringify(pantry));
  return pantry;
}

// ---------- router ----------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    try {
      // Health
      if (url.pathname === "/health") {
        return json({ ok: true, time: new Date().toISOString() }, {}, origin);
      }

      // Recipes
      if (url.pathname === "/recipes" && request.method === "GET") {
        return json(await getRecipes(env), {}, origin);
      }
      if (url.pathname === "/recipes" && request.method === "PUT") {
        const why = requireAuth(request, env);
        if (why) return err(401, why, origin);
        const body = await request.json();
        if (!Array.isArray(body)) return err(400, "expected an array of recipes", origin);
        await putRecipes(env, body);
        return json({ ok: true, count: body.length }, {}, origin);
      }
      const recipeMatch = url.pathname.match(/^\/recipes\/([^/]+)$/);
      if (recipeMatch) {
        const id = recipeMatch[1];
        if (request.method === "PUT") {
          const why = requireAuth(request, env);
          if (why) return err(401, why, origin);
          const body = await request.json();
          const updated = await upsertRecipe(env, id, body);
          return json(updated, {}, origin);
        }
        if (request.method === "DELETE") {
          const why = requireAuth(request, env);
          if (why) return err(401, why, origin);
          await deleteRecipe(env, id);
          return json({ ok: true }, {}, origin);
        }
      }

      // Weekplan
      if (url.pathname === "/weekplan" && request.method === "GET") {
        return json(await getWeekplan(env), {}, origin);
      }
      if (url.pathname === "/weekplan" && request.method === "PUT") {
        const why = requireAuth(request, env);
        if (why) return err(401, why, origin);
        const body = await request.json();
        if (!body || !body.week_start) return err(400, "week_start required", origin);
        await putWeekplan(env, body);
        return json({ ok: true }, {}, origin);
      }

      // Eaten log
      if (url.pathname === "/eaten-log" && request.method === "GET") {
        return json(await getEatenLog(env), {}, origin);
      }
      if (url.pathname === "/eaten-log" && request.method === "POST") {
        const why = requireAuth(request, env);
        if (why) return err(401, why, origin);
        const { recipe_id, date } = await request.json();
        if (!recipe_id || !date) return err(400, "recipe_id and date required", origin);
        const log = await recordEaten(env, recipe_id, date);
        return json({ ok: true, count: (log[recipe_id] || []).length }, {}, origin);
      }

      // Feedback
      if (url.pathname === "/feedback" && request.method === "POST") {
        const body = await request.json();
        if (!body || !body.date || !body.recipe_id || typeof body.rating !== "number") {
          return err(400, "date, recipe_id, rating required", origin);
        }
        const res = await appendFeedback(env, body);
        return json({ ok: true, ...res }, {}, origin);
      }
      if (url.pathname === "/feedback" && request.method === "GET") {
        const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
        return json(await getFeedbackForWeek(env, date), {}, origin);
      }

      // Pantry (what helper already has in the house)
      if (url.pathname === "/pantry" && request.method === "GET") {
        return json(await getPantry(env), {}, origin);
      }
      if (url.pathname === "/pantry" && request.method === "POST") {
        const { item, have } = await request.json();
        if (!item) return err(400, "item required", origin);
        const pantry = await togglePantry(env, item, !!have);
        return json({ ok: true, count: Object.keys(pantry).length }, {}, origin);
      }

      return err(404, `no route: ${request.method} ${url.pathname}`, origin);
    } catch (e) {
      return err(500, String(e?.message || e), origin);
    }
  },
};
