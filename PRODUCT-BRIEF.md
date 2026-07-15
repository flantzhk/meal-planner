# Lantz Meal Planner — Product Brief

> For designers who need to understand the full product before working on it.

**Current version:** v2.3 · 2026-05-08  
**Live planner:** https://flantzhk.github.io/meal-planner/  
**Helper view:** https://flantzhk.github.io/meal-planner/helper.html  
**Backend:** Cloudflare Worker + KV (no database — JSON blobs in KV storage)

---

## Who is this for?

Two users. Very different needs.

**Faith** — the planner. Plans the week on desktop or laptop. Needs to see the full 7-day grid, browse the recipe library, and generate a shopping list. Always English. Comfortable with technology.

**Leni (Auntie Leni)** — the family helper. Cooks the food. Opens the helper view on her phone every morning. Reads in Tagalog or Ilocano. Needs big text, clear timings, and the YouTube video for each dish. Not technical.

---

## Design language

- **Colour palette:** Cream `#F4F1EC`, Sand `#EAE3D9`, Ink `#1A1A1A`, Terra (red-orange) `#C8392B`, Sage (grey) `#6B6B6B`
- **Typography:** Source Serif 4 (headings/display), Inter (body), JetBrains Mono (numbers)
- **Warm, editorial roundedness** — cards and controls use soft rounded corners (`rounded-lg`/`xl`/`2xl`); pill-shaped tags (`rounded-full`) reserved for status/filter chips
- **Light mode only** — no dark mode
- **Warm, editorial feel** — not a typical app aesthetic. Feels like a nice cookbook, not a SaaS dashboard.

---

## App 1: Planner (Faith's view — `index.html`)

Desktop-first. Faith uses this to plan the week.

### Header bar
- App title: "Lantz Meal Planner"
- Week navigation: `◀ prev` / `next ▶` — shifts to the previous or next week. Loads saved plan from server if it exists, or creates a blank scaffold.
- "copy last week" — copies meal assignments from the previous week's saved plan into the current week
- **Serves selector** — global serves count for the week (2–6 people). Affects ingredient scaling.
- **Helper view** button — opens `helper.html` in a new tab
- **Recipes** button — opens the Recipe Library modal
- **Shopping list** button — opens the Shopping List modal
- **Save button** — saves the week plan to the server. Turns red with a `●` dot when there are unsaved changes. Shows "Saved ✓" when clean.
- **Settings** (⚙) — opens the Settings panel

### Today's cooking timeline (collapsible card)
Shown above the week grid. Shows a chronological timeline of cooking tasks for today only:
- ❄️ Defrost reminders (for tomorrow's meals that need overnight defrosting)
- 🧂 Marinate reminders
- 🔥 Start cooking
- 🍽️ Serve

Tasks earlier than now are shown greyed-out with strikethrough. The "up next" task is highlighted in terra/red. The collapsed state shows just the next upcoming task ("Next: 6:30pm — Start cooking Adobo").

### Missed prep alert
If it's past 9am and today has a meal that needed overnight prep (defrost/marinate), a banner appears warning Faith and offering a "Switch meal" button that immediately opens the recipe picker for that slot.

### Week grid (desktop)
A 7-column × 3-row table. Columns = days (Mon–Sun). Rows = Breakfast, Lunch, Dinner.

**Meal cell** — each cell contains:
- Time input (inline time picker) and Serves selector — defaults to Breakfast 7:15am / Lunch 12:00pm / Dinner 6:30pm
- Cost, if any recipe has a price: per-person leads (larger, terra-coloured), total shown smaller underneath
- 🌙 badge (amber) if any recipe in this meal needs overnight prep
- **Dish rows** — the canonical pattern for showing a planned dish, used on both desktop and mobile: a small square thumbnail on the left, role label + dish name stacked to the right. One row per dish, never a shared image strip — adding more dishes adds more rows instead of shrinking existing thumbnails. Three primary slots (Protein 🥩, Vegetable 🥦, Carb 🍚) always render a row, even empty (dashed placeholder + "Add x")
- Starter 🍽️, Soup 🍲, Salad 🥗 — always-visible footer of three equal-width pills, 44px tap targets, present whether or not anything is planned yet

Tapping a filled dish row opens the recipe preview modal. Tapping an empty row or a starter/soup/salad pill opens the recipe picker modal.

Today's column has a red top border and `bg-terra/5` background. The current meal row label has a `●` indicator.

### Mobile layout
On small screens, the week grid becomes a vertical stack of day cards (one card per day). Each day card shows the three meals as stacked sub-cards, using the same dish-row pattern as desktop (thumbnail left, name stacked right) at slightly larger touch-friendly sizing — 52px thumbnails, 56px row height, 44px starter/soup/salad pills. Same tap behaviour as desktop.

---

## Recipe Picker modal

Opens when you tap an empty meal component slot.

**Header:** shows what you're picking ("Picking Protein", "Picking Vegetable", etc.) with a "Show all types" toggle to ignore the component filter.

**Recently used row** — horizontal scrollable chips showing the 6 most recently eaten recipes for this meal type. Each chip shows the recipe thumbnail and name.

**Protein filter pills** — All / chicken / beef / pork / fish / salmon / shrimp / squid / tuna / seafood / halloumi / bacon / egg / tofu. Only shows proteins that exist in the library.

**Search input** — filters recipe names.

**Cooking style dropdown** — stir-fry, roast, steamed, one-pan, sheet-pan, fried, quick, make-ahead, grilled, braised, baked.

**Recipe grid** — 2-column grid. Each card: thumbnail, name, cuisine + total time, "last eaten" pill (colour-coded: recent = terra, warming = amber, stale = grey, never = faded text).

---

## Recipe Preview modal

Opens when you tap a filled component slot. Shows the full recipe.

- Recipe photo (YouTube thumbnail or hero_image)
- Meal type label, recipe name, cuisine + timing info
- **Start time** — calculated automatically: serve time minus cook time minus prep time. Shows in large display font.
- **Serve at / Eating** controls — inline time picker and person count selector. Adjusting these recalculates the start time and scales the ingredient list.
- **Watch video** button — links to YouTube. OR "Paste YouTube link" inline editor if no video is set yet.
- **Ingredients** — scaled to the current serves count. Each row shows amount, unit, ingredient name. Checkboxes to mark items "In pantry". Dropdown to set where to buy each ingredient (saves globally for that ingredient across all recipes).
- **Steps** — numbered list with terra-coloured step numbers.
- **Change** button — goes back to the recipe picker for this slot
- **Edit recipe** button — opens the Recipe Form modal
- **Remove** button — clears this component slot

---

## Recipe Library modal

Browse all recipes. Filterable by:
- Search (name)
- Meal type: Any / Breakfast / Lunch / Dinner
- Cuisine: derived from the library (Filipino, Chinese, Western, etc.)
- Component type pills: All / Protein / Vegetable / Carb / Starter / Soup / Salad / Dessert / Meal Prep

Shows count ("12 of 34 recipes"). Each card has thumbnail, name, cuisine + time, last-eaten pill, meal type tags. Hovering reveals a ✏️ edit button.

**+ New recipe** button at top-right.

---

## Recipe Form modal

Create or edit a recipe. Sections:

**Basic info**
- Recipe name (English) — auto-generates the ID slug
- ID (shown only when creating)
- Cuisine (with datalist suggestions)
- Component type (dropdown: Protein / Vegetable / Carb / Starter / Soup / Salad / Dessert / Meal Prep)
- Meal type (checkboxes: breakfast / lunch / dinner — multiple allowed)
- Serves (base)
- Prep time / Cook time / Active time (minutes)
- Estimated cost (HKD)
- YouTube URL
- Hero image URL

**Tagalog / Ilocano name translations** (collapsible — toggle to show/hide)

**Dependencies** — things that must happen before cooking:
- Marinate (X hours before)
- Defrost (X hours before)

**Ingredients** — a list with per-row fields: Item name / Amount / Unit (g, kg, ml, l, tsp, tbsp, cup, oz, lb, whole, cloves, sprigs, bunches) / Category (produce, meat, dairy, pantry, bakery, frozen, other) / Shop (wet market, supermarket, HKTVmall, other) / Scaling mode (linear, fixed, taper). Responsive: stacked cards on mobile, grid on desktop.

**Steps** — numbered textarea list. When translations are expanded: each step has English + Tagalog + Ilocano fields.

**Actions** — Create/Save, Cancel, Delete (with confirmation step).

---

## Shopping List modal

Auto-generated from the current week's plan. Only includes ingredients for days from today onward (already-cooked days are skipped).

**WhatsApp share button** — formats the list as a plain text message and opens `wa.me` to send it.

**Filter/jump nav** (sticky) — pills to jump to a specific store section:
- All
- 🥬 Wet market (count remaining / total)
- 🛒 Fusion / Marketplace (count remaining / total)  
- 📦 HKTVmall (count remaining / total)
- ➕ Extras (count remaining / total, shown if any extras exist)

**Per-store sections** — items grouped by store, then by category (Meat & Seafood, Vegetables & Fruit, Dairy & Eggs, Pantry & Dry Goods, Bread & Bakery, Frozen, Other). Each row: checkbox / amount+unit / item name / store dropdown (to reassign). Ticked items are faded with strikethrough.

**Extras section** — non-recipe shopping items (toilet paper, etc.). Add with a text input + store picker. Each item: checkbox, name, store label, × remove.

**Pantry integration** — ingredients checked "In pantry" anywhere in the app show as ticked here.

---

## Settings panel

- Worker URL field (the Cloudflare Worker endpoint)
- Faith token field (password input)
- Test button — pings `/health` and shows the result
- Save button — stores to localStorage and reloads the page

---

## App 2: Helper view (Leni's view — `helper.html`)

Mobile-first. Designed for a phone held in one hand. Leni opens this every morning.

### Language toggle
Three options: English / Tagalog (default) / Ilocano. Persists in localStorage. Controls all text in the UI — meal names, step instructions, UI labels.

### NowBar (fixed top strip, always visible)
Left: live HK clock (updates every 30s, colon blinks). Right: "Start cooking next meal — in X min" or "⚡ Now" (turns terra/red when overdue) or "🌙 All done".

### Today's meals section

Three cards (breakfast, lunch, dinner). Each card:

- Meal name in selected language
- "Please cook this for X people" — serves count
- **Image** — YouTube thumbnail or hero image
- **Start cooking at: [time]** — calculated start time with a 20-minute buffer added for Leni
- **Food on the table by: [time]** — serve time
- **▶ Watch video** button (opens YouTube inline player)
- **How to make each dish** — expandable recipe cards for each component in the meal:
  - Recipe name (translated)
  - Ingredients list (scaled, translated)
  - Numbered steps (translated)
  - Translation unverified warning if not yet confirmed (shows English fallback)
- **👍 / 👎 / 💬 feedback** — Leni rates each meal and can leave a note. Saves to `/feedback` on the server.
- Overnight prep warning (🌙 badge) if prep should have been done previously

### This Week section
Shows all 7 days of the current week's plan. Each day lists the planned meals. No interaction — read-only.

### Before you sleep tonight section
If tomorrow's meals have defrost or marinate dependencies: shows Leni what to take out of the freezer or start marinating tonight. Appears automatically.

### "All meals served" state
When all today's meals are past their serve time: shows "🌙 All meals served for today — you're done!" with a thank you message.

---

## Data model

All data lives in Cloudflare KV.

| KV key | Contents |
|---|---|
| `recipes` | Array of all recipe objects |
| `weekplan:current` | The currently active week plan |
| `weekplan:archive:YYYY-MM-DD` | Archived prior weeks (auto-saved when a new week is saved) |
| `eaten-log` | `{ recipe_id: ["YYYY-MM-DD", ...] }` — drives last-eaten tracking |
| `feedback:YYYY-Www` | Array of `{date, meal, recipe_id, rating, note}` from Leni |
| `pantry` | `{ item_name: "YYYY-MM-DD" }` — items currently in the pantry |
| `sources` | `{ item_name: "wet-market|supermarket|hktvmall" }` — where to buy each ingredient |
| `extras` | Array of non-recipe shopping items |

### Recipe object shape

```json
{
  "id": "chicken-adobo",
  "name": "Chicken Adobo",
  "name_tl": "Adobong Manok",
  "name_il": "Adobo nga Manok",
  "cuisine": "Filipino",
  "meal_type": ["lunch", "dinner"],
  "component_type": "protein",
  "serves_base": 4,
  "prep_time_mins": 15,
  "cook_time_mins": 45,
  "active_time_mins": 20,
  "estimated_cost_hkd": 120,
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "hero_image": "https://...",
  "translations_verified": false,
  "tags": ["chicken", "braised", "make-ahead"],
  "dependencies": [
    { "type": "marinate", "hours_before": 2 }
  ],
  "ingredients": [
    {
      "item": "chicken thighs",
      "amount": 800,
      "unit": "g",
      "category": "meat",
      "source": "wet-market",
      "scales": "linear"
    }
  ],
  "steps": [
    {
      "step": 1,
      "instruction": "Marinate chicken in soy sauce and vinegar...",
      "instruction_tl": "I-marinate ang manok...",
      "instruction_il": "I-marinate ti manok..."
    }
  ]
}
```

### Week plan object shape

```json
{
  "week_start": "2026-05-04",
  "serves": 4,
  "days": [
    {
      "day": "Monday",
      "date": "2026-05-04",
      "breakfast": null,
      "lunch": {
        "protein": "chicken-adobo",
        "vegetable": "garlic-bok-choy",
        "carb": "steamed-rice",
        "soup": null,
        "salad": null,
        "starter": null
      },
      "lunch_time": "12:30",
      "lunch_serves": 5,
      "dinner": null
    }
  ]
}
```

---

## Scheduling logic (shared.js)

The `MP.schedule` module calculates start times by working backwards:

```
start = serve_time - cook_time_mins - prep_time_mins
```

Dependencies (marinate, defrost) generate additional tasks earlier in the day. If start time is before 7am (helper's start), it's flagged as `⚠ early` and either moved forward or flagged for the previous night.

**Stove conflict detection** — if two meals in the same day have overlapping active cooking windows, a conflict is flagged on the planner (⚠ badge).

**Ingredient scaling** — three modes:
- `linear` — scales proportionally with serves count
- `fixed` — always the same amount (e.g. salt, oil)
- `taper` — scales sub-linearly (good for aromatics)

All quantities are normalised to canonical units internally (ml for volume, g for weight) to allow deduplication across recipes.

---

## To-do list

### In progress / immediate

- [ ] **Multiple recipes per component slot** — each slot currently holds a single recipe ID. Need to support an array of IDs so you can have e.g. two proteins in one meal. Requires: updated data model, planner UI to add/remove from a slot, helper view showing all of them side by side.

### Explicitly out of scope (v1)

These were decided against for v1 and should not be designed for now:

- Printable cook packs (phone-first approach is sufficient)
- Cantonese as a 4th language
- Automated WhatsApp sending
- Nutritional information / macros
- Multi-household support
- AI-generated meal suggestions

### Known gaps / future candidates

- **Feedback loop UI** — Leni's 👍/👎 ratings are saved but Faith has no view in the planner to see them. A "This week's feedback" panel would close this loop.
- **Recipe YouTube URLs** — seeded recipes currently have search URLs, not specific video links. Each needs to be manually updated.
- **Translation verification** — `translations_verified` flag exists but the planner has no batch workflow to review and approve translations.
- **Budget tracking** — estimated cost per recipe is stored (`estimated_cost_hkd`) but there's no spending summary or weekly budget view built yet.
- **Week history view** — week plans are archived on save but there's no UI to browse past weeks.
- **Cantonese** — mentioned as v2 candidate if Leni requests it.
- **Push notifications** — "time to start cooking" reminder sent to Leni's phone.

---

## Key URLs and technical details

| Item | Value |
|---|---|
| Planner | https://flantzhk.github.io/meal-planner/ |
| Helper | https://flantzhk.github.io/meal-planner/helper.html |
| Worker | https://meal-planner-api.faith-lantz-ee8.workers.dev |
| Local code | `~/Documents/Faith Second Brain 2026/03 Projects/Meal Planning/meal-planner/` |
| Stack | React 18 (no build — Babel standalone), Tailwind CDN, Cloudflare Worker + KV |
| Auth | Faith has a bearer token; helper view is public/unauthenticated |
