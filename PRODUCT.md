# Product

## Register

product

## Users

Two distinct users sharing the same data:

**Faith (planner)** — plans the week's meals from a desktop browser, manages the recipe library, builds shopping lists, tracks the food budget. She wants the planning session to be fast and low-friction — pick meals, save, done. She's in a domestic context, not a work context; the app competes with her time and attention in the evenings or weekends.

**Leni (cook/helper)** — follows the helper view on a phone or tablet while cooking. She is visual, not a reader. She needs to know: what am I cooking today, what are the steps, and where do I buy what. She reads in English, Tagalog, or Ilocano. Her context is the kitchen: hands may be busy, light may be variable, she needs clarity at a glance.

## Product Purpose

A household meal planning system that runs week to week without friction. The family eats well — healthy, varied, calorie-rich, genuinely enjoyable — because there is a clear plan and Leni can execute it confidently. Without this tool, meals get bland (same rotation) and shopping is improvised (wasted budget). Success looks like: Faith spends 15 minutes planning on Sunday, Leni follows the plan all week without asking questions, the family looks forward to meals.

## Brand Personality

Warm, organised, considered. The feeling of a well-run kitchen — calm surfaces, everything in its place, a sense that someone who cares has thought this through. Not cold, not clinical, not chaotic.

## Anti-references

- **Generic SaaS dashboard** — blue sidebar, metric cards, corporate UI grids. No personality, no warmth.
- **Diet / fitness apps** — calorie counters, green health badges, clinical white, food-as-medicine aesthetic. Food should feel like pleasure, not a prescription.
- **Busy recipe aggregators** — AllRecipes, Yummly: cluttered, ad-heavy, overwhelming. Every element competing for attention.
- **Overly playful / childish** — cartoon food icons, primary colour palettes, bubble fonts. The family is adults with taste.

## Design Principles

1. **Kitchen clarity** — every element earns its place. If it creates confusion rather than reducing it, remove it. The planner grid should be readable in one scan.

2. **Two views, one truth** — Faith's planner and Leni's helper view are the same data seen differently. Both are first-class surfaces. Never optimise one at the expense of the other.

3. **Food is pleasure** — the interface should make food feel desirable and cooking feel achievable, not administrative. Images, warmth, and calm rhythms over clinical lists.

4. **Progressive disclosure** — show what's needed now; details on demand. The week grid shows the shape of the week. The meal cell shows today's components. The recipe modal shows the steps.

5. **Trust through consistency** — Leni executes what the screen says. Inconsistent labels, hidden information, or confusing UI means meals don't get cooked right. Clarity is a functional requirement, not a nice-to-have.

## Accessibility & Inclusion

- Light mode only. No dark mode.
- Helper view must be legible in varying kitchen light conditions — sufficient contrast, large enough touch targets, clear hierarchy.
- Language switching (English / Tagalog / Ilocano) is a core feature for Leni's view.
- No reduced-motion preference currently handled; add if needed.
