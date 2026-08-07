# LIFT Tailux v1.0 — Design System

A design system extracted from **Tailux**, the React + Tailwind CSS v4 admin dashboard
platform used by LIFT (`liftsoft.vn`). Everything here is lifted from the shipped
source — colours, spacing, radii, component geometry, copy voice and iconography are
read out of the codebase rather than invented.

---

## 1. Product context

Tailux is a dashboard *platform*, not a single app. From its own documentation:

> "Tailux is a cutting-edge React-based dashboard theme designed for developers seeking
> efficiency, flexibility, and aesthetics. Built with Tailwind CSS, it offers a seamless
> blend of Dark & Light Layouts…"

It ships as two parallel distributions — a **starter** (empty shell, routing + layout +
theme only) and a **demo** (the full catalogue) — each in a JavaScript and a TypeScript
flavour. The TypeScript demo is the canonical source for this design system.

### Surfaces the platform covers

| Surface | What it is |
| --- | --- |
| **Dashboards** | 16 analytics views — Sales, CRM, Orders, Banking ×2, Crypto ×2, Education, Teacher, Doctor, Authors, CMS, Employees, Influencer, Meetings, Travel, Workspaces, Personal, Projects Board |
| **Apps** | Chat, AI Chat, Mail, Kanban, File Manager, POS, To-do, Travel, NFT ×2, List |
| **Pages** | Auth (sign-in/sign-up), Settings, Errors (401/404/429/500), Help, Onboarding, Invoice, Pricing |
| **Tables & Forms** | TanStack-powered advanced tables, multi-step forms, validation, file upload, rich text |
| **Docs site** | In-app documentation with a TOC rail, syntax-highlighted examples and a live theme customiser |

### Two layouts, one chrome

- **`main-layout`** — a 4.5rem icon rail (`--main-panel-width`) pinned to the edge, an
  optional 230px "prime panel" listing that section's pages, and a sticky 65px header.
  This is the default.
- **`sideblock`** — one 17.5rem sidebar, no rail. Used for docs and content-heavy views.

### Runtime theming

The user, not the designer, picks the palette. Three independent axes plus a card skin,
all switched by data attributes on `<html>`:

| Axis | Attribute | Options (default first) |
| --- | --- | --- |
| Neutral ramp | `data-theme-light` | `slate` · `gray` · `neutral` |
| Dark ramp | `data-theme-dark` | `cinder` · `navy` · `mirage` · `mint` · `black` |
| Accent | `data-theme-primary` | LIFT rose (fixed — the template's six swappable accents are not shipped) |
| Card skin | `data-card-skin` | `shadow` · `bordered` |
| Mode | `class="dark"` | light / dark |
| Monochrome | `body.is-monochrome` | a full-page `backdrop-grayscale` accessibility mode |

**Design implication:** never hard-code a hex. Design against `--color-primary-600` and
the `--this` slot. The template ships six swappable accents; **LIFT does not** — the
accent is fixed to the logo's rose so the product and the mark agree. The light/dark
ramps and card skin remain switchable.

---

## 2. Sources

- **Codebase (mounted, read-only):** `tailux/` — `ts/demo` (canonical), `ts/starter`,
  `js/demo`, `js/starter`, plus `Documentation/Documentation Online (Recommended).html`
  (a link-out to the hosted docs; no offline copy is included).
- Key files read: `ts/demo/src/styles/**` (tokens, component CSS, layouts),
  `ts/demo/src/components/ui/**` (the component library),
  `ts/demo/src/constants/{app,colors}.ts`, `ts/demo/src/app/layouts/**`,
  `ts/demo/src/app/pages/**`, `ts/demo/package.json`.
- **No Figma file and no brand guidelines document were provided.** Voice, motion and
  layout rules below are inferred from the shipped code, not from a written brand book.
- Package identity: `react-tailux-ts-vite` v1.3.4. App name constant: `Tailux`.

---

## 3. Content fundamentals

**Voice: plain, brisk, second person, sentence-shaped.** Tailux talks like a competent
tool, not a personality. It does not joke, apologise at length, or use exclamation marks
outside of celebratory microcopy.

**Casing.** Title Case for anything that names a place or an action — page titles, buttons,
menu items, table headers: `Sales Dashboard`, `Sign In`, `Back To Home`, `Chat Settings`,
`Block User`, `Create account`. Sentence case for prose, helper text and descriptions:
`Please sign in to continue`, `This page you are looking not available. Please back to home`.
Table column headers are set in **UPPERCASE** by CSS (`.table-th`), not by the copy.

**Person.** "You" appears only where the user is being instructed (`Please sign in to
continue`). Otherwise copy is impersonal and object-first — `Last seen recently`,
`Payment authorised`, `22.6k`. First person ("I", "we") never appears in product UI; it
appears in docs prose only as "Developers will appreciate…" style third person.

**Length.** Buttons are one or two words (`Sign In`, `View Lessons`, `Back To Home`).
Field labels are one word where possible (`Username`, `Password`, `Country`). Empty-state
and error copy is exactly two lines: a bold statement, then one sentence of guidance:

> **Oops. This Page Not Found.**
> This page you are looking not available. Please back to home

**Placeholders describe the input, they don't instruct.** `Enter Username`,
`Enter Password`, `Search here...`, `Write a message...`. Note the trailing ellipsis on
open-ended fields (search, compose) and its absence on closed ones.

**Numbers are abbreviated and unqualified.** `22.6k`, `$24,780`, `85%`, `1,284`. Metrics
are never wrapped in a sentence — the label sits above, the number sits alone below.

**Greetings are personalised and warm, but short.** `Welcome Back, Caleb` /
`Your student completed 85% of tasks` / `Progress is excellent!` — this is the *only*
register where an exclamation mark is allowed, and only on a dashboard welcome card.

**Emoji: never.** There is not one emoji in the product UI. Status is carried by coloured
badges and dots; celebration is carried by illustration (`react-confetti` is a dependency,
used on completion screens). Unicode symbols appear only as functional glyphs (the `/`
search shortcut, `«` `»` in pagination), never as decoration.

**Things the voice avoids:** marketing superlatives inside the app, "Oops!" with an
exclamation mark, "Please note", "Simply", em-dash asides, and questions as headings.

---

## 4. Visual foundations

### Colour

- **One accent at a time.** The primary ramp — the logo gradient's rose terminus
  `#eb6b91`, deepened to `#dc4b78` for fills — carries every action. The gradient itself
  (`--gradient-brand`) is the identity and appears once per screen at most.
- **The palette is the logo.** Gold `#ffe253` and rose `#eb6b91` are the gradient's two
  ends; amber `#f7b46a` and coral `#ef8583` are its mid-stops and become warning and
  error. Nothing in the accent set was invented.
- **Semantics are fixed:** secondary = gold, warning = amber, error = coral pushed red
  `#e4574b` (warm, never a fire-engine red), info = a desaturated sky, success = a warm
  green. Info and success have no counterpart in the logo — see "Intentional additions".
- **Every accent is a four-step set** (`lighter` / `light` / base / `darker`). Fills use
  the base; text on light backgrounds uses `darker`; text on dark backgrounds uses
  `lighter`. That inversion is the single most important colour rule in the system.
- **Greys are warm, never blue.** Both neutral ramps are built around the wordmark ink
  `#3f3b3a`, which sits at `--color-gray-800`. A typical screen is 90%
  `--color-gray-50` page, white cards, `--color-gray-700` text, with rose appearing
  three or four times.
- Colour is never the only signal: a status badge always carries a word, never just a hue.
- **Never write `color: #fff` on an accent fill.** Gold and amber can't carry white text,
  so every filled surface reads `--on-this`, which the colour slot flips to
  `--color-gray-900` for `secondary` and `warning` and leaves white everywhere else.

### Type

Inter, and only Inter — variable, optical sizing 14–32, loaded from Google Fonts. The
scale is Tailwind's plus four Tailux half-steps (`tiny-plus` 11px, `xs-plus` 13px,
`sm-plus` 15px) that exist because dashboard chrome needs finer gradation than 12→14→16.
Body is **14px/20px, weight 400**. Headings rarely exceed 24px. Weight, not size, carries
hierarchy: 500 for anything interactive or labelled, 600 for metrics and page titles.
`letter-spacing: 0.025em` on buttons, badges, tags and inputs — a small, consistent
loosening that makes 13–14px UI text feel calmer.

### Backgrounds

Flat colour. No photographic backgrounds, no textures, no patterns, no mesh gradients.
The page is a flat grey (`--bg-page`), cards are flat white. **Two exceptions:**
1. Welcome/hero and balance cards use the **brand gradient** with white text and a flat
   illustration on top. Use `--gradient-brand-deep` (the rose half) whenever the panel
   carries text — the full gold-to-rose `--gradient-brand` cannot hold white copy.
   These are decorative panels, not page backgrounds.
2. Chart fills use a vertical gradient of the series colour, 45% → 10% opacity.

### Cards

8px radius. Either a soft shadow on white with a grey page behind (`skin="shadow"`), or a
1px `--border-subtle` hairline on white with a white page behind (`skin="bordered"`).
One skin per application, chosen in the theme — never mixed. Cards carry **no padding of
their own**; content sets `px-4 py-3` (→ `px-5` at `sm`), forms and dialogs use `p-5`
(→ `p-7` at `lg`). Charts bleed to the card edge while the heading stays padded.

### Shadows

Exactly one signature elevation:
`rgba(63,59,58,.14) 0 0 2px 0, rgba(63,59,58,.1) 0 12px 24px -4px` — tinted with the
wordmark ink, not a blue-grey. A warm contact ring plus a wide soft lift; it reads as
paper on a warm desk, not as a drop shadow. Menus and popovers use the same ink at lower
alpha. **Dark mode removes
shadows almost entirely**: depth there comes from surface value (`dark-900` page →
`dark-750` sidebar → `dark-700` card), not from light. There are no inner shadows anywhere.

### Borders and dividers

Hairlines. 1px `--border-subtle` for card edges, table rules and section dividers. Inputs
rest at `--color-gray-300`, hover to `--color-gray-400`, focus to `--color-primary-600`.
2px is reserved for avatar rings and the switch thumb inset; 3px for spinner arcs and the
step connector. There are no thick decorative rules and no coloured left-border accents.

### Corner radii

Effectively a two-radius system: **8px** (`--radius-lg`) for everything you can click or
that holds content — buttons, inputs, cards, menus, nav items — and **`full`** for
anything round: avatars, switches, progress rails, icon buttons, pills, chips. **4px**
(`--radius-sm`) is used *only* for badges, tags and checkboxes, which stay deliberately
squarer than buttons.

### Motion

Short and functional. **200ms** is the house transition and covers buttons, inputs,
hovers and nav. **250ms** for anything that changes layout (sidebar, collapse, content
width) with `ease-in` closing and `ease-out` opening. Nothing bounces, nothing overshoots,
nothing has a spring. `--ease-elastic: cubic-bezier(.53,.21,.29,.67)` is the one
expressive curve and it is used **only** on indeterminate loaders — the spinner, the
indeterminate progress bar and the skeleton wave. Checkboxes and radios scale their glyph
from 0→1 over 200ms. Live states get a `ping` halo (timeline points, avatar dots),
never a pulse on the element itself.

### Hover, focus and press

- **Filled controls** darken one step on hover (`--this` → `--this-darker`) and drop to
  90% opacity of that on press.
- **Soft / flat / outlined controls** deepen their tint rather than changing hue:
  8% → 15% → 20% alpha of `--this-darker`.
- **Neutral flat controls** wash with `gray-300 / 20%`.
- **Nothing scales, lifts or moves on hover.** The only transform in the system is the
  range-slider thumb, which scales to 1.25× while dragged.
- **Focus** is a colour change, not a ring — inputs move their border to the accent, and
  affix glyphs tint with them. The one true ring is the switch: a 3px accent halo at 50%.
- **Disabled** = `opacity: .7` (`.6` in dark mode) plus `pointer-events: none`. Disabled
  fields also take a grey fill.

### Transparency and blur

Used in exactly three places, always for chrome that overlays content:
the sticky header (`bg-white/80` + `backdrop-blur-sm backdrop-saturate-150`), soft
component variants (7–20% alpha tints), and the monochrome accessibility overlay. Cards
and panels are always fully opaque.

### Fades over hard edges

Where content scrolls, Tailux masks rather than covering: `ScrollShadow` applies a CSS
`mask-image` gradient at whichever edge has more to scroll, so the fade works over any
background. The last timeline item's connector fades to transparent the same way. There
are no "protection gradient" strips or capsule scrims.

### Imagery

Warm, naturally-lit stock photography with real skin tones — never desaturated,
never duotoned, no grain, no colour overlay. Photos sit inside 8px corners, cropped with
`object-fit: cover`. Avatars are always circular. Illustrations are flat vector scenes,
mostly white/grey with **one** accent hue driven by CSS variables (`--primary`,
`--primary-light`), so they retint with the theme.

### Layout rules

- The icon rail and header are `position: fixed` / `sticky`; content scrolls under them.
- Content is inset by `--margin-x` — 1rem mobile, 1.5rem tablet, **4rem** desktop,
  tightening back to 1.5rem when the sidebar is open.
- Everything is a 12-column grid. Card gaps step 1rem → 1.25rem (`sm`) → 1.5rem (`lg`)
  in lockstep with card padding.
- Dense tables and lists are the norm; whitespace is bought with grouping, not padding.

---

## 5. Iconography

**Two libraries plus one bespoke set. No icon font, no sprite sheet, no emoji.**

1. **Heroicons** (`@heroicons/react` v2) — the workhorse. Two weights are used with
   intent: `24/outline` at 1.5px stroke for anything at 20–24px (headers, toolbars,
   field prefixes), and `20/solid` for small inline affordances (chevrons, ellipsis
   menus, sort arrows). Sizes are set with `size-4` / `size-5` / `size-5.5` classes and
   the icon always inherits `currentColor`.
   → Available from CDN; nothing to copy. `https://heroicons.com`
2. **React Icons** (`react-icons` v5) — used only for third-party brand marks that
   Heroicons doesn't carry.
3. **Bespoke SVGs shipped in the repo** — copied into `assets/`:
   - `assets/dualicons/` (14) — the sidebar rail set. Two-opacity single-colour SVGs
     that inherit the accent, so the rail reads as a coherent family at 28px.
   - `assets/nav-icons/` (40 of ~90 copied) — line icons for the prime panel and menus.
   - `assets/folders/` (6) — semantic folder glyphs, one per accent. The file manager is
     the only place the palette is used purely decoratively.
   - `assets/illustrations/` (30) — flat vector scenes for empty states, auth, errors and
     onboarding. Several accept `--primary` / `--primary-light` CSS variables and retint
     with the theme.
   - `assets/brand-logos/` (8) — third-party marks (Google, GitHub, Figma, …) used on
     OAuth buttons and integration lists.

**Rules.** Icons are monochrome and inherit text colour; they are never given their own
brand hue. Icon-only buttons are circular, 32–36px, `variant="flat"`. An icon never
appears without either a label or a tooltip. Unicode characters are used as glyphs only
where they are genuinely typographic — the `/` search shortcut badge, `«` `»` in
pagination edges, `…` in pagination dots.

**Logo.** `assets/logo/lift-logo.svg` (mark + ink wordmark), `lift-logo-reverse.svg`
(mark + white wordmark) and `lift-mark.svg` (the mark alone, extracted from the supplied
lockup) are the real supplied files. The mark carries the fixed gold-to-rose gradient and
is **never** recoloured, flattened to one hue, or given `currentColor`; only the wordmark
switches between ink and white. Mark alone at 2.25rem in the sidebar rail; full lockup at
9.5rem on auth screens.

---

## 6. Components

Built from the source inventory in `ts/demo/src/components/ui/**` — nothing added that
the kit doesn't define.

**`components/core/`** — `Button`, `Card`, `Box`, `Avatar`, `AvatarDot`, `CopyButton`

**`components/forms/`** — `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`,
`Range`, `Upload`, `Swap` (+ `SwapOn`, `SwapOff`), `InputErrorMsg`

**`components/data-display/`** — `Badge`, `Tag`, `Table` (+ `THead`, `TBody`, `TFoot`,
`Tr`, `Th`, `Td`), `Timeline` (+ `TimelineItem`), `Progress`, `Circlebar`, `Skeleton`,
`Spinner`, `GhostSpinner`

**`components/navigation/`** — `Accordion` (+ `AccordionItem`), `Collapse`, `Pagination`,
`ScrollShadow`

Each directory has a `@dsCard` showcase HTML; each component has a `.d.ts` props contract
and a `.prompt.md` usage note.

### Deliberately not built

`Steps` — the source ships `.steps` CSS but no React component, so the CSS class is
included in `tokens/components.css` and no component wraps it. Modals, tooltips, menus,
tabs and toasts in Tailux are **Headless UI** primitives styled inline at the call site,
not kit components — recreate them with the documented chrome (see the UI kits) rather
than reaching for a component that doesn't exist here.

### Intentional additions

No components. Two **colours**: `info` and `success` have no counterpart in the LIFT
logo, but a dashboard cannot signal "in progress" and "done" without them. Both are
desaturated toward the warm palette so they sit beside the brand hues rather than fighting
them. If LIFT has official status colours, replace `--color-info-*` and
`--color-success-*` in `tokens/palette.css` — nothing else needs to change.

### Small implementation differences from the source

- The source rebinds the colour slot with a generated Tailwind class (`this:success`);
  here it is a `data-color="success"` attribute so it works in plain CSS. Same variables,
  same result.
- `tokens/utilities.css` adds a ~120-rule utility layer (sizes, spacing, flex, type)
  named exactly like the Tailwind classes the source uses, so examples and UI kits run
  without a Tailwind build. It is not a Tailwind reimplementation.
- `Circlebar` is drawn with `stroke-dasharray` on a circle rather than the source's
  gap-aware arc path generator; gap/offset degrees and the gradient variant are not
  reproduced.

---

## 7. Index

```
styles.css                  ← the single entry point consumers link
tokens/
  fonts.css                 Inter via Google Fonts (no binaries ship with Tailux)
  palette.css               primitive ramps + the --this colour slot
  typography.css            family, size ramp, weights, tracking
  spacing.css               4px scale + layout frame dimensions
  radius.css                corner radii
  elevation.css             shadow-soft and friends
  motion.css                durations and easings
  semantic.css              --text-*, --surface-*, --border-*, --accent-*
  themes.css                .dark scope + card-skin scopes
  base.css                  document reset + type role classes
  components.css            component classes, translated 1:1 from the source
  utilities.css             the small utility layer
components/{core,forms,data-display,navigation}/
guidelines/                 25 foundation specimen cards
ui_kits/_shared/kit.jsx     Icon (live-fetch SVG) and Chart (ApexCharts) helpers
ui_kits/dashboard/          Sales analytics view
ui_kits/apps/               Chat and Kanban
ui_kits/auth/               Sign-in, sign-up and 404
templates/dashboard-page/   Copyable starting point for consuming projects
assets/logo/                lift-logo.svg · lift-logo-reverse.svg · lift-mark.svg
assets/{dualicons,nav-icons,illustrations,folders,brand-logos,avatars,imagery}/
thumbnail.html              project tile
SKILL.md                    Agent Skills entry point
```
