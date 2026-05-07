---
name: hotdesk
description: Internal hotdesk booking app for GGS. Currently in mockup phase — clickable UI prototype with no backend. Use when designing, building, or iterating on the hotdesk mockup. Covers stack, GGS brand tokens, mock data conventions, and references to the GGS brand book.
---

# Hotdesk Booking App — Mockup Phase

Internal tool for GGS employees to book a desk for a given day. Currently a **clickable mockup** with hardcoded data and stubbed auth, ahead of stakeholder sign-off and backend work.

## Phases

- **Mockup (current)** — static UI, hardcoded floors/desks/bookings, fake "Sign in with Google" button.
- **MVP** — real Auth.js + Google, Prisma + PostgreSQL, persistent bookings.
- **Full** — admin tools, multi-floor, polish.

This skill covers the mockup only.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** with GGS brand tokens (see below)
- **shadcn/ui**, restyled with brand colors
- **Plus Jakarta Sans** via `next/font/google`
- **No DB, no Auth.js** — mock data in `lib/mock.ts`, fake sign-in just sets a client flag
- **lucide-react** for icons (neutral, doesn't fight the brand)

## Brand — from the GGS Brand Book

Source of truth: `GGS_-_Brand_Book_-_Styleguide_UPDATED.pdf`. The book governs logo, color, typography, illustration, and data viz. Always defer to it; the tokens below are a pre-extracted subset for fast reference.

### Colors

```ts
// tailwind.config.ts → theme.extend.colors
brand: {
  purple:    '#592be5', // primary — CTAs, "booked" state, accents
  navy:      '#213669', // primary — headings, body text, dark surfaces
  cyan:      '#38ebe8', // primary — "free" state, decorative blocks, highlights
  'blue-200':'#9db2e6', // secondary — borders, inactive
  lilac:     '#d8cff6', // secondary — subtle hover/selection
  mist:      '#edf2f7', // secondary — page backgrounds
}
```

Status mapping for desks:

- **Free** → `brand.cyan`
- **Booked** → `brand.purple`
- **Inactive** → `brand.blue-200` at 50% opacity
- **Hover (free)** → ring in `brand.purple`

Never inline hex codes outside `tailwind.config.ts`. Always reference via `brand.*` tokens.

### Typography

- Family: **Plus Jakarta Sans** (Google Fonts, weights 400 / 500 / 700, italic).
- Headings: 700.
- Subheads / labels / buttons: 500.
- Body: 400.
- Italic: sparingly — only for source attributions or quiet meta info, per brand book p.28.

### Logo

- Use provided logo files only — never recreate, recolor, distort, or rotate (brand book p.13).
- Full-color logo only on white, black, or `brand.navy` backgrounds (p.8).
- Header: full-color logo on white, ~40px tall.
- Favicon: signet (hexagon mark) only.
- Files live in `/public/brand/` once provided by the marketing team.

### Visual language

- **Cyan accent blocks** — solid `brand.cyan` rectangles behind or beside page titles, echoing the brand book covers. Component: `<AccentBlock />`.
- **Hexagon motif** — from the logo, used decoratively but sparingly. Component: `<Hexagon />`.
- **Illustrations** — clean, open composition, limited palette (p.21-24). Use sparingly in empty states.
- **Data viz** — Plus Jakarta throughout, headers between gray lines (top 3px, bottom 1px), source attribution bottom-right in italic (p.27-28).

## Architecture (mockup)

```
/app
  /(auth)/login          fake Google sign-in screen
  /(app)/book            floor plan + date picker + booking modal
  /(app)/my-bookings     user's mock bookings
  /admin                 styled but non-interactive previews
/components
  /brand                 Logo, AccentBlock, Hexagon
  /floor-plan            FloorPlanSvg, DeskMarker, FloorSelector
  /booking               DatePicker, BookingModal, BookingCard
  /ui                    shadcn, restyled
/lib
  mock.ts                seed data + in-memory mutations
  brand.ts               status → color helpers
/public
  /floors                sample SVG floor plans
  /brand                 logo files (svg + png)
```

## Mock data shape

```ts
// lib/mock.ts
export const currentUser = { id: 'u1', name: 'Karol', email: 'karol@ggsitc.com' }

export const floors = [
  { id: 'f1', name: 'Kraków HQ — 3rd floor', svgPath: '/floors/krk-3.svg' },
]

export const desks = [
  { id: 'd1', label: 'A12', floorId: 'f1', x: 120, y: 240, active: true },
  // ...
]

export const bookings = [
  { id: 'b1', deskId: 'd1', userId: 'u2', userName: 'Anna K.', date: '2026-05-12' },
  // ...
]
```

State lives in `useState` at the page level; mutations are in-memory only. Refresh resets to seed.

## Floor plan in the mockup

- Drop one SVG into `/public/floors/` (a traced or recreated version of the existing scan).
- Render via `<img>` or inline SVG, sized to a fixed canvas.
- Overlay desk markers as absolutely-positioned `<button>`s at `(Desk.x, Desk.y)`.
- Click → `BookingModal` with desk label + selected date.

For the mockup, one floor with ~10 desks (mix of free / booked / inactive) is enough.

## Conventions

- No code comments unless genuinely non-obvious.
- Tailwind inline. Brand colors only via `brand.*` tokens.
- Server components by default; `"use client"` only where state or handlers are needed.
- Plus Jakarta Sans loaded via `next/font/google` and applied at `<html>` level.
- Keep components dumb — props in, JSX out, mutations via `useState` higher up.
- Status colors via `lib/brand.ts` helpers (`statusColor(status)`), never duplicated in components.

## Common tasks

- **Adjust a color** → only in `tailwind.config.ts` brand tokens.
- **Add a desk** → append to `desks` in `lib/mock.ts`.
- **Swap floor SVG** → replace file in `/public/floors/`, update `floors[].svgPath`.
- **Tweak marker style** → `components/floor-plan/DeskMarker.tsx` only.
- **Add a brand element** (accent block, hexagon) → `components/brand/`.

## Out of scope for the mockup

- Real Google OAuth.
- Database / persistence.
- Admin write actions (admin pages are visual previews).
- Email / notifications.
- Validation rules (one-per-day, 30-day horizon, etc. — apply in MVP).
