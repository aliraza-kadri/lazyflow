# LazyFlow — Official Website

Business automation studio website + admin dashboard, built with Next.js (App
Router), TypeScript and Tailwind CSS v4.

This build is **frontend-only**, as requested. No database, authentication or
backend is connected — everything in `/admin` runs on mock data held in
`src/lib/mock-data.ts`, and the public contact form simulates a submission
without sending it anywhere.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin` for the admin dashboard.

## What's important to know before the next phase

### 1. No logo files were included with this build
You mentioned attaching 3 logo files (horizontal / stacked / icon-only), but
none came through. Everything currently uses a placeholder gradient "flow
loop" mark built from scratch in `src/components/ui/logo.tsx`.

**To swap in your real logos:** drop the files into `/public/logo/` and
replace the `<Mark />` SVG / wordmark markup inside
`src/components/ui/logo.tsx` (or swap it for `<img>` tags). Because every
navbar, footer, and admin sidebar imports `LogoHorizontal`, `LogoStacked` and
`LogoIcon` from that one file, the whole site updates instantly — nothing
else needs to change.

### 2. One place to change contact details
`src/config/site.ts` holds the WhatsApp number, email and social links used
across the entire public site. Change the number there and every "Automate
My Business" / "Talk to Us" / "Find My Automation" button updates.

### 3. Connecting a real backend later
The code is structured so Supabase (or any backend) can be added without
rebuilding the UI:

- `src/lib/types.ts` — shared types (`Lead`, `Service`, `CaseStudy`) already
  match a sensible table shape.
- `src/lib/mock-data.ts` — swap these arrays for real queries (e.g.
  `supabase.from('leads').select('*')`) and the admin pages that consume them
  need no other changes.
- `src/components/contact/contact-form.tsx` — the `handleSubmit` function has
  a single `// NOTE` marking exactly where to replace the simulated delay
  with a real insert / API call.
- Admin "Save" actions (Services, Case Studies, Website Content, Settings,
  Lead notes/status) are all local React state for now — each has a `// NOTE`
  comment marking where a real update call belongs.

### 4. Admin panel
`/admin` is not authenticated yet — there's no login gate. Add real auth
before this ever goes to a public server.

## Structure

```
src/
  app/                  Routes (public pages + /admin)
  components/
    ui/                 Buttons, cards, form fields, logo, section wrappers
    layout/              Navbar, footer, page header
    home/                Homepage sections (hero, problems, how-it-works, etc.)
    admin/               Sidebar, topbar, stat cards, status badges, modal
    contact/             Contact form
  lib/
    content.ts           Static copy: problems, services, process steps, industries
    mock-data.ts         Mock leads / services / case studies / settings for /admin
    types.ts             Shared TypeScript types
    whatsapp.ts           wa.me link builder + pre-filled message templates
  config/
    site.ts               WhatsApp number, email, socials, nav links
```

## Pages

**Public:** Home, Services, How It Works, Solutions, About, Contact

**Admin (`/admin`):** Dashboard, Leads (+ detail view), Services, Case
Studies, Website Content, Settings
