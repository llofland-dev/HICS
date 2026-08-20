# HICS Incident Tracker

Next.js (App Router) + Supabase frontend for the multi-facility HICS incident
tracker. Schema and RLS policies live in `../supabase/migrations`.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and anon key.
2. Apply the migrations in `../supabase/migrations` to that project
   (`supabase db push` or run them via the SQL editor, in order).
3. `npm install`
4. `npm run dev`

New users need a row in `public.profiles` linking them to an organization
before they can see any facility data — that's an admin/service-role action,
not currently exposed in the app.
