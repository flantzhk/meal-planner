// shared.js — pure utilities used by both index.html and helper.html
// Exposes a single global `MP` (meal-planner) object. No module system —
// loaded via <script src="shared.js"></script> before the React entry.

(function (global) {
  const MP = {};

  // ---------- API client ----------
  MP.api = (() => {
    // Default: relative to current origin. For GitHub Pages you'll override
    // via localStorage.mpApiBase (set in Settings panel of the planner).
    function base() {
      return (
        localStorage.getItem("mpApiBase") ||
        "https://meal-planner-api.faith-lantz-ee8.workers.dev"
      );
    }
    function token() {
      return localStorage.getItem("mpFaithToken") || "";
    }
    async function req(method, path, body) {
      const headers = { "content-type": "application/json" };
      const t = token();
      if (t) headers.authorization = `Bearer ${t}`;
      const res = await fetch(base() + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${method} ${path} → ${res.status}: ${text}`);
      }
      return res.json();
    }
    return {
      base,
      setBase: (v) => localStorage.setItem("mpApiBase", v),
      setToken: (v) => localStorage.setItem("mpFaithToken", v),
      hasToken: () => !!token(),
      getRecipes: () => req("GET", "/recipes"),
      putRecipes: (arr) => req("PUT", "/recipes", arr),
      upsertRecipe: (id, r) => req("PUT", `/recipes/${encodeURIComponent(id)}`, r),
      deleteRecipe: (id) => req("DELETE", `/recipes/${encodeURIComponent(id)}`),
      getWeekplan: () => req("GET", "/weekplan"),
      putWeekplan: (p) => req("PUT", "/weekplan", p),
      getEatenLog: () => req("GET", "/eaten-log"),
      recordEaten: (recipe_id, date) => req("POST", "/eaten-log", { recipe_id, date }),
      postFeedback: (entry) => req("POST", "/feedback", entry),
      getFeedback: (date) => req("GET", `/feedback?date=${encodeURIComponent(date)}`),
      getPantry: () => req("GET", "/pantry"),
      togglePantry: (item, have) => req("POST", "/pantry", { item, have }),
      health: () => req("GET", "/health"),
    };
  })();

  // ---------- Dates ----------
  MP.date = {
    // Hong Kong today as YYYY-MM-DD
    hkToday() {
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric", month: "2-digit", day: "2-digit",
      });
      return fmt.format(new Date());
    },
    // Hong Kong current hour (0-23)
    hkHour() {
      const s = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Hong_Kong", hour: "2-digit", hour12: false,
      }).format(new Date());
      return parseInt(s, 10);
    },
    // Which meal is "now" based on HK hour: before 10 → breakfast, before 3pm → lunch, else dinner
    currentMeal() {
      const h = MP.date.hkHour();
      if (h < 10) return "breakfast";
      if (h < 15) return "lunch";
      return "dinner";
    },
    parse(s) {
      // Parse YYYY-MM-DD as a local date at noon (avoids TZ edge cases).
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    },
    format(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    },
    addDays(s, n) {
      const d = MP.date.parse(s);
      d.setDate(d.getDate() + n);
      return MP.date.format(d);
    },
    // Monday of the week containing the given HK date
    mondayOf(dateStr) {
      const d = MP.date.parse(dateStr);
      const dow = (d.getDay() + 6) % 7; // 0 = Mon
      d.setDate(d.getDate() - dow);
      return MP.date.format(d);
    },
    daysBetween(a, b) {
      return Math.round((MP.date.parse(b) - MP.date.parse(a)) / 86400000);
    },
    dayName(dateStr, lang = "en") {
      const d = MP.date.parse(dateStr);
      const i = (d.getDay() + 6) % 7; // 0 = Mon
      return MP.i18n.days[lang][i];
    },
    prettyDate(dateStr, lang = "en") {
      const d = MP.date.parse(dateStr);
      const monthIdx = d.getMonth();
      const day = d.getDate();
      const month = MP.i18n.months[lang][monthIdx];
      return `${day} ${month}`;
    },
  };

  // ---------- i18n ----------
  MP.i18n = {
    languages: [
      { code: "en", label: "English" },
      { code: "tl", label: "Tagalog" },
      { code: "il", label: "Ilocano" },
    ],
    days: {
      en: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      tl: ["Lunes","Martes","Miyerkules","Huwebes","Biyernes","Sabado","Linggo"],
      il: ["Lunes","Martes","Miyerkoles","Huwebes","Biernes","Sabado","Dominggo"],
    },
    months: {
      en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
      tl: ["Enero","Pebrero","Marso","Abril","Mayo","Hunyo","Hulyo","Agosto","Setyembre","Oktubre","Nobyembre","Disyembre"],
      il: ["Enero","Pebrero","Marso","Abril","Mayo","Hunio","Hulio","Agosto","Septiembre","Oktubre","Nobiembre","Disiembre"],
    },
    meals: {
      en: { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" },
      tl: { breakfast: "Almusal",   lunch: "Tanghalian", dinner: "Hapunan" },
      il: { breakfast: "Pammigat",  lunch: "Pangaldaw",  dinner: "Pangrabii" },
    },
    ui: {
      en: { start: "Start", steps: "Steps", ingredients: "Ingredients",
            prepTomorrow: "Prep for tomorrow", today: "Today",
            watch: "Watch video", loved: "Loved", disliked: "Didn't like",
            comment: "Note", save: "Save", verify: "Translation OK?",
            lastEaten: "Last eaten", never: "never", daysAgo: "d ago",
            noPlanToday: "No meals planned for today yet.",
            shopping: "Shopping list", savePlan: "Save Week",
            serves: "Serves", language: "Language", newRecipe: "+ New recipe",
            settings: "Settings", apiBase: "Worker URL", token: "Faith token",
            conflict: "Stove conflict with adjacent meal",
            startEarly: "Start previous day — confirm with Faith" },
      tl: { start: "Simula", steps: "Mga hakbang", ingredients: "Mga sangkap",
            prepTomorrow: "Paghahanda para bukas", today: "Ngayon",
            watch: "Panoorin ang video", loved: "Gusto", disliked: "Hindi gusto",
            comment: "Puna", save: "I-save", verify: "Tama ba ang salin?",
            lastEaten: "Huling kinain", never: "hindi pa", daysAgo: "araw na",
            noPlanToday: "Wala pang nakatakdang pagkain para ngayon.",
            shopping: "Listahan ng pamimili", savePlan: "I-save ang Linggo",
            serves: "Para sa", language: "Wika", newRecipe: "+ Bagong resipe",
            settings: "Mga setting", apiBase: "URL ng Worker", token: "Faith token",
            conflict: "Magkabanggaan sa kalan",
            startEarly: "Simulan kagabi — kumpirmahin kay Faith" },
      il: { start: "Irugi", steps: "Dagiti addang", ingredients: "Dagiti sangkap",
            prepTomorrow: "Panagisagana para inton bigat", today: "Ita",
            watch: "Buyaen ti video", loved: "Naimas", disliked: "Haan a naimas",
            comment: "Palawag", save: "Isalbar", verify: "Husto ti patarus?",
            lastEaten: "Kamaudianan a nangan", never: "awan pay", daysAgo: "aldaw",
            noPlanToday: "Awan pay ti naiplano a taraon para ita.",
            shopping: "Listaan ti gatgatangen", savePlan: "Isalbar ti Lawas",
            serves: "Para iti", language: "Pagsasao", newRecipe: "+ Baro a resipe",
            settings: "Dagiti setting", apiBase: "URL ti Worker", token: "Token ni Faith",
            conflict: "Agdidinnupag ti kalan",
            startEarly: "Irugi iti napalabas nga aldaw — palubusan ni Faith" },
    },
    t(lang, key) {
      return (this.ui[lang] && this.ui[lang][key]) || this.ui.en[key] || key;
    },
    recipeName(r, lang) {
      if (lang === "tl" && r.name_tl) return r.name_tl;
      if (lang === "il" && r.name_il) return r.name_il;
      return r.name;
    },
    stepText(s, lang) {
      if (lang === "tl" && s.instruction_tl) return s.instruction_tl;
      if (lang === "il" && s.instruction_il) return s.instruction_il;
      return s.instruction;
    },
  };

  // ---------- Units & scaling ----------
  // Canonical units: "ml" for volume, "g" for weight, "count" for whole items.
  const VOLUME = { tsp: 5, tbsp: 15, cup: 240, ml: 1, l: 1000 };
  const WEIGHT = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };

  function unitFamily(u) {
    if (VOLUME[u] != null) return "volume";
    if (WEIGHT[u] != null) return "weight";
    return "count";
  }

  function toCanonical(amount, unit) {
    if (VOLUME[unit] != null) return { family: "volume", value: amount * VOLUME[unit] };
    if (WEIGHT[unit] != null) return { family: "weight", value: amount * WEIGHT[unit] };
    return { family: "count:" + unit, value: amount };
  }

  function fromCanonical(family, value) {
    if (family === "volume") {
      if (value >= 1000) return { amount: +(value / 1000).toFixed(2), unit: "l" };
      return { amount: Math.round(value), unit: "ml" };
    }
    if (family === "weight") {
      if (value >= 1000) return { amount: +(value / 1000).toFixed(2), unit: "kg" };
      return { amount: Math.round(value), unit: "g" };
    }
    const unit = family.startsWith("count:") ? family.slice(6) : "whole";
    return { amount: +value.toFixed(2), unit };
  }

  MP.units = { unitFamily, toCanonical, fromCanonical };

  MP.scale = function scaleIngredient(ing, serves, servesBase) {
    const ratio = serves / (servesBase || 4);
    const mode = ing.scales || "linear";
    let amt = ing.amount;
    if (mode === "linear") amt = ing.amount * ratio;
    else if (mode === "taper") amt = Math.max(ing.amount * 0.25, ing.amount * Math.pow(ratio, 0.85));
    // "fixed" → unchanged
    return { ...ing, amount: amt };
  };

  // Consolidate a list of ingredients (possibly same item, different recipes/units)
  // into a shopping list grouped by source/category.
  MP.buildShoppingList = function buildShoppingList(recipes, weekplan) {
    const servesTarget = weekplan.serves || 4;
    const byKey = new Map(); // key: item|source → { item, source, category, total_canonical }

    for (const day of weekplan.days || []) {
      for (const meal of ["breakfast", "lunch", "dinner"]) {
        const id = day[meal];
        if (!id) continue;
        const r = recipes.find((x) => x.id === id);
        if (!r) continue;
        for (const ing of r.ingredients || []) {
          const scaled = MP.scale(ing, servesTarget, r.serves_base || 4);
          const { family, value } = toCanonical(scaled.amount, scaled.unit);
          const key = `${ing.item.toLowerCase()}|${ing.source || "other"}|${family}`;
          const existing = byKey.get(key) || {
            item: ing.item, source: ing.source || "other",
            category: ing.category || "other", family, total: 0,
          };
          existing.total += value;
          byKey.set(key, existing);
        }
      }
    }

    // Group by source, then category.
    const groups = {};
    for (const v of byKey.values()) {
      const { amount, unit } = fromCanonical(v.family, v.total);
      groups[v.source] = groups[v.source] || {};
      groups[v.source][v.category] = groups[v.source][v.category] || [];
      groups[v.source][v.category].push({ item: v.item, amount, unit });
    }
    return groups;
  };

  // ---------- Start time / scheduling ----------
  const MEAL_TIME = { breakfast: 7.5 * 60, lunch: 12 * 60, dinner: 18 * 60 };
  const HELPER_START_MIN = 7 * 60;

  function fmtTime(minutesFromMidnight) {
    const m = ((minutesFromMidnight % (24 * 60)) + 24 * 60) % (24 * 60);
    let h = Math.floor(m / 60);
    const mm = String(Math.round(m % 60)).padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${h}:${mm}${ampm}`;
  }

  MP.schedule = {
    // Returns { startTime: "4:50pm", startMin, flagEarly: bool, deps: [...] }
    forMeal(mealType, recipe) {
      const cook = recipe.cook_time_mins || 0;
      const prep = recipe.prep_time_mins || 0;
      const startMin = MEAL_TIME[mealType] - cook - prep;
      const deps = (recipe.dependencies || []).map((d) => ({
        type: d.type,
        hours_before: d.hours_before,
        when: d.type === "defrost"
          ? "previous day morning"
          : `${d.hours_before}h before cooking`,
      }));
      const flagEarly = startMin < HELPER_START_MIN || deps.some((d) => d.type === "defrost");
      return {
        startMin,
        startTime: fmtTime(startMin),
        flagEarly,
        deps,
      };
    },
    fmtTime,
    // Detect overlapping active cook windows for a day's meals (stove conflict).
    dayConflicts(day, recipesById) {
      const slots = [];
      for (const meal of ["breakfast", "lunch", "dinner"]) {
        const id = day[meal];
        if (!id) continue;
        const r = recipesById[id];
        if (!r) continue;
        const sched = MP.schedule.forMeal(meal, r);
        const active = r.active_time_mins || r.prep_time_mins || 20;
        slots.push({ meal, start: sched.startMin, end: sched.startMin + active });
      }
      const conflicts = [];
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          if (slots[i].end > slots[j].start && slots[j].end > slots[i].start) {
            conflicts.push([slots[i].meal, slots[j].meal]);
          }
        }
      }
      return conflicts;
    },
  };

  // ---------- YouTube ----------
  // Extract the 11-char video id from a YouTube URL. Returns null for
  // search URLs or anything we don't recognise.
  MP.youtubeId = function youtubeId(url) {
    if (!url || typeof url !== "string") return null;
    // Don't match search result pages.
    if (url.includes("/results?")) return null;
    const patterns = [
      /[?&]v=([A-Za-z0-9_-]{11})/,            // youtube.com/watch?v=ID
      /youtu\.be\/([A-Za-z0-9_-]{11})/,       // youtu.be/ID
      /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
      /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  MP.youtubeThumb = function youtubeThumb(url, quality = "maxresdefault") {
    const id = MP.youtubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
  };

  // Best image for a recipe card: YouTube thumbnail if we have a real video,
  // else the curated hero_image. The caller can hide on error.
  MP.recipeImage = function recipeImage(recipe) {
    return MP.youtubeThumb(recipe && recipe.youtube_url) || (recipe && recipe.hero_image) || null;
  };

  // ---------- Last-eaten ----------
  MP.lastEaten = function lastEaten(recipeId, eatenLog, today) {
    const dates = (eatenLog && eatenLog[recipeId]) || [];
    if (dates.length === 0) return { days: null, status: "never" };
    const maxDate = dates.reduce((a, b) => (a > b ? a : b));
    if (maxDate > today) return { days: 0, status: "fresh" }; // future-dated (planned)
    const days = MP.date.daysBetween(maxDate, today);
    let status = "stale";
    if (days < 7) status = "recent";
    else if (days < 14) status = "warming";
    else status = "stale";
    return { days, status, lastDate: maxDate };
  };

  global.MP = MP;
})(window);
