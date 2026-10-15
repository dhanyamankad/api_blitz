# API Blitz

Registration, team showcase, API allotment and submissions site for API Blitz (Microsoft Club, DAU).
Full specification: [docs/SPEC.md](docs/SPEC.md).

**Stack:** Next.js 15 (App Router) · Tailwind · Auth.js v5 (Google) · Prisma · Supabase Postgres · Vercel

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (see below)
3. `npm run db:push` to create tables, then `npm run db:seed` for placeholder settings and sample APIs
4. `npm run dev` and open http://localhost:3000

### Supabase
Create a project, then copy the pooled connection string (port 6543) into `DATABASE_URL` and the direct one (port 5432) into `DIRECT_URL`.

### Google OAuth
In Google Cloud Console create an OAuth client (Web application) with redirect URIs:
- `http://localhost:3000/api/auth/callback/google`
- `https://<your-vercel-domain>/api/auth/callback/google`

Put the client ID/secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. Generate `AUTH_SECRET` with `npx auth secret`.

### Admins
Set `ADMIN_EMAILS` to a comma-separated list (`microsoftclub@dau.ac.in` plus a test email).

## Deploying to Vercel
Import the GitHub repo and add the same environment variables (set `AUTH_URL` to the production URL). `npm run build` already runs `prisma generate`.

## Auth notes
Only `@dau.ac.in` Google accounts can sign in. The `hd` parameter is a UX hint only; the real check is the server-side `signIn` callback in `src/auth.ts`.

## Roadmap (see docs/SPEC.md section 11)
- [x] Day 1: project skeleton, schema, Google auth with domain lock, settings helpers, CI
- [ ] Day 2: registration form + validations, first-login linking UI, admin approval queue
- [ ] Day 3: admin API assignment + CSV import, landing page, showcase gallery
- [ ] Day 4: team dashboard, API reveal, submission with deadline lock, anonymized realtime ticker
- [ ] Day 5: admin submissions table + CSV export, edge cases, polish
- [ ] Day 6: buffer and real-device testing

## Branching
`main` is deployable. Work on `feature/<name>` branches and open a PR; CI runs typecheck and build.
