@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # start the Next.js dev server (localhost:3000)
npm run build            # next build
npm run start             # run the production build
npm run lint              # eslint via eslint.config.mjs
npm run db:migrate        # create/apply a Prisma migration in dev (prisma migrate dev)
npm run db:migrate:deploy # apply pending migrations in production (prisma migrate deploy)
npm run db:studio         # open Prisma Studio against DATABASE_URL
```

There is no test suite in this repo (no test runner is configured) and no `npx tsc` script — validate changes with `npm run lint` and `npm run build`.

Two linters are configured but only one is wired up: `eslint` runs via `npm run lint`; `.oxlintrc.json` (oxlint) exists but has no npm script — don't assume `npm run lint` covers oxlint rules too.

## Architecture

This is a Next.js (App Router) marketing site for "Successbrew" backed by Neon Postgres via Prisma, with Neon Auth for authentication. There is no CMS — content is stored in Postgres and edited through a hand-built `/sbh-1111` panel.

**Read `node_modules/next/dist/docs/` before writing Next.js code** — see AGENTS.md above; the installed Next.js version (16.2.9) has breaking changes vs. training data.

### Content pipeline: Postgres (Prisma) → server component → client component

Every public page is a pattern of two files:
- `src/app/<route>/page.tsx` — server component. Fetches content via the query helpers in `src/lib/queries/content.ts` (thin wrappers around `prisma.<model>.findMany`/`findUnique`), wrapped in `.catch(() => [])`. `export const revalidate = 0` — pages are always dynamic, never ISR-cached.
- `src/components/<Name>PageClient.tsx` — `"use client"` component that receives the fetched data as props and renders the actual UI/animations.

### Database (Prisma + Neon)

- Schema lives in `prisma/schema.prisma`; migrations in `prisma/migrations/`. Run `npm run db:migrate` after editing the schema.
- `src/lib/prisma.ts` builds the Prisma client using `@prisma/adapter-neon` + `@neondatabase/serverless` (over a `ws` websocket), reading `DATABASE_URL` (pooled) and `DIRECT_URL` (direct, used by Prisma CLI for migrations) from `.env.local`.
- Content models: `Service`, `ProcessStep`, `CaseStudy`, `Stat`, `Testimonial`, `CommunityEvent`, `PodcastEpisode`, `CommunityWin`, `CommunityPost`, `Blog`, `BrandPartner` (shared by the brand-partners/community-partners/community-members admin sections via its `group` enum), `SiteSettings` (singleton row).
- Image fields are plain URL strings today (`src/lib/admin/field-types.ts`); AWS S3 env vars exist in `.env.local` for a future upload widget but aren't wired into a component yet.

### Admin panel

- Every content type has its own route group under `src/app/sbh-1111/<type>/` (`page.tsx` list view, `new/page.tsx`, `[id]/edit/page.tsx`, `actions.ts` server actions).
- `actions.ts` files call `verifyAdminSession()` (`src/lib/auth/dal.ts`) then delegate to the generic `runCreate`/`runUpdate`/`runDelete`/`runReorder` helpers in `src/lib/admin/crud.ts`, passing a Prisma delegate (`prisma.<model>`), a Zod schema, and form data. Per-type Zod schemas + field/column configs live in `src/lib/admin/schemas/<type>.ts`. The blog admin section (`src/app/sbh-1111/blog/actions.ts`) is the one exception — it works with typed JSON (Tiptap rich text) instead of the generic FormData path.
- Auth is Neon Auth (`@neondatabase/auth`), configured in `src/lib/auth/server.ts` and mounted at `src/app/api/auth/[...path]/route.ts`. Neon Auth's built-in role is binary (`user`/`admin`); a finer-grained `SUPER_ADMIN`/`EDITOR` tier is layered on top via the Prisma `AdminProfile` model, keyed by the Neon Auth user id.

### UI layer

- `src/components/ui/*` are shadcn/ui primitives (`components.json`, style "new-york", base color "zinc") built on Radix UI + `class-variance-authority` + the `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge). Add new primitives with the shadcn CLI conventions already reflected in `components.json` rather than hand-rolling.
- Route transitions are handled globally by `src/components/PageTransition.tsx`, wrapping `children` in `src/app/layout.tsx` — animations for individual pages should compose with this rather than adding a second transition layer.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
