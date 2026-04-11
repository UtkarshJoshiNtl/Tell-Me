# Tell Me

Minimal personal productivity app: **tasks** (title, date, type) and **expenses** (amount, note, date). **PWA**-installable with basic offline shell. Auth and data live in **Supabase**.

## Requirements

- Node.js 20+ (matches typical Next.js 16 environments)
- A [Supabase](https://supabase.com) project

## Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Optional. ISO 4217 for expense formatting (default `USD`) |
| `NEXT_PUBLIC_ENABLE_SW` | Optional. Set to `1` to register the service worker in **development** (production registers by default) |

Aliases `SUPABASE_URL` / `SUPABASE_ANON_KEY` are also supported (see `lib/supabase/env.ts`).

## Supabase setup

1. **SQL**: In the SQL editor, run migrations in `supabase/migrations/` in order (`00001`, then `00002` if your project predates enum grants, then `00003` if `due_on` is missing on `tasks`).
2. **Auth → URL configuration**: Add redirect URLs for every origin you use, for example:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/update-password`
   - The same paths on your **production** domain.
3. **Email**: Enable the Email provider. If **Confirm email** is on, new users must confirm before a session exists (the sign-up form explains this).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint
```

## Deploy (Vercel)

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com), **Import** the repository; framework **Next.js** is auto-detected.
3. Under **Environment variables**, add the same keys as in `.env.local` (at minimum the two Supabase `NEXT_PUBLIC_*` variables).
4. Deploy. Use **HTTPS** in production so the **service worker** and **PWA install** work reliably.

`next.config.ts` sets security headers for all routes and `Cache-Control` / `Service-Worker-Allowed` for `/sw.js`.

## PWA notes

- Install is driven by the web app manifest (`app/manifest.ts`) and icons under `public/`.
- After deploy, users should open the app **once online** so navigations and `/_next/static` assets can populate the runtime cache.
- Bump cache names in `public/sw.js` when you need to force clients to drop old cached HTML after a breaking release.

## License

Private / your choice.
