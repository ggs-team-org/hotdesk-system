# Hotdesk Booking App — Spec (Mockup phase)

## Goal

Let GGS employees book a desk for a given day from a visual floor plan. Phase 1 is a **clickable mockup** to validate UX with stakeholders before committing to backend work.

## Brand alignment

All visual decisions follow the **GGS Brand Book** (`GGS_-_Brand_Book_-_Styleguide_UPDATED.pdf`). It is the source of truth for:

- Logo usage and clear space (pages 7–13).
- Core colors — `#592be5` purple, `#213669` navy, `#38ebe8` cyan, plus the secondary palette (page 15).
- Typography — Plus Jakarta Sans, weights Bold / Medium / Regular / Italic (page 17).
- Illustration & data viz style (pages 21–28).

The mockup must look like a GGS product, not a generic SaaS. See `SKILL.md` for the pre-extracted token subset used in code.

## Users

- **Employee** — signs in with Google (org domain), books a desk, sees own bookings, cancels own bookings.
- **Admin** — everything above, plus manages floors, desks, and bookings. In the mockup, admin screens exist but are non-interactive.

## Mockup scope

A clickable Next.js prototype demonstrating:

1. **Login** — single "Sign in with Google" button. Click takes user straight to `/book` as a hardcoded user. No real OAuth.
2. **Book a desk** — `/book` shows date picker, floor selector, SVG floor plan with colored desk markers, click → confirm modal → marker turns purple.
3. **My bookings** — `/my-bookings` lists 2–3 hardcoded upcoming bookings + cancel button.
4. **Admin (visual only)** — `/admin/floors`, `/admin/desks` shown as styled tables; CRUD buttons present but disabled or no-op.

State lives in memory; refresh resets to seed data. Intentional — the mockup is for design review, not production use.

## Flows (target UX, regardless of phase)

### Sign in
1. User opens app, sees branded login screen — navy background, full-color logo, cyan accent block.
2. Click "Sign in with Google" → in MVP redirects to OAuth; in mockup goes straight to `/book`.
3. Domain restriction enforced in MVP, not mockup.

### Book a desk
1. `/book` shows date picker (default = today), floor selector, SVG floor plan with desk markers.
2. Markers colored by availability for the selected date — **cyan** (free), **purple** (booked), **light blue** at 50% (inactive).
3. Hovering a booked marker shows the booker's name.
4. Click free desk → modal: "Book desk A12 for Tue 12 May? [Confirm] [Cancel]".
5. Confirm → marker turns purple, optimistic update.

### View / cancel bookings
- `/my-bookings` lists upcoming bookings with cancel button.
- Past bookings collapsed below.

## Rules (apply in MVP+; mockup does not enforce)

- One desk = one booking per day.
- No partial-day or recurring bookings (v1).
- Bookings allowed up to 30 days in advance.
- Cancel allowed up to start of booked day.

## Floor plan source

Existing physical maps available as photo scans. For the mockup, one floor is enough. Workflow:

1. Take a clean orthogonal photo of the chosen floor map (iPhone is sufficient; no LiDAR needed).
2. Trace in Figma or recreate from scratch — recreating is usually faster for simple plans.
3. Export SVG, drop into `/public/floors/`.
4. Hand-place desk coordinates in `lib/mock.ts`.

## Phases

**Phase 1 — Mockup (current)**
Clickable Next.js prototype, branded per GGS Brand Book, hardcoded data, fake auth. Goal: stakeholder sign-off on UX and visual direction.

**Phase 2 — MVP**
Replace mock data with PostgreSQL + Prisma. Real Google OAuth via Auth.js, domain-restricted. Single floor live, employees self-serve.

**Phase 3 — Multi-floor + admin**
Floor management, desk placement UI, admin views, force-cancel, role management.

**Phase 4 — Polish**
Email reminders, occupancy stats, dark mode, CSV export.

## Out of scope (all phases v1)

Meeting rooms, half-day or hourly slots, recurring bookings, Slack/Teams notifications, native mobile app.

## Open questions

- Org domain to whitelist (mockup uses `@ggsitc.com`).
- Default booking horizon — 30 days OK?
- Should `/book` show "who's in today" alongside the floor plan, or is the marker hover enough?
- Floor plan: hand off existing scans for tracing or recreate clean ones in Figma from scratch?
- Logo & icon files: need official assets from marketing before we can ship visuals.
