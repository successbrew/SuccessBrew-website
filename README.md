# Successbrew

Marketing site and admin CMS for **Successbrew** — a content, community, and visibility ecosystem for ambitious brands, creators, and founders. Built with Next.js (App Router) and Neon Postgres, with a hand-built admin panel in place of a traditional CMS.

**Live site:** [successbrew.in](https://successbrew.in)

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Database:** [Neon Postgres](https://neon.tech), accessed via [Prisma](https://www.prisma.io) over the `@neondatabase/serverless` driver
- **Auth:** [Neon Auth](https://neon.tech/docs/guides/auth) (`@neondatabase/auth`), with a custom `SUPER_ADMIN` / `EDITOR` role tier layered on top
- **UI:** [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives, style "new-york")
- **Animation:** [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) for smooth scroll
- **Rich text:** [Tiptap](https://tiptap.dev) (used in the blog admin editor)
- **Storage:** AWS S3 (via `@aws-sdk/client-s3`) for media uploads
- **Validation:** [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com)

## Getting Started

### Prerequisites

- Node.js 20+
- A Neon Postgres project (with Neon Auth enabled)
- AWS S3 credentials (for the media upload widget)

### Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your own values:

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | Pooled Neon Postgres connection string (used at runtime) |
   | `DIRECT_URL` | Direct Neon Postgres connection string (used by Prisma CLI for migrations) |
   | `NEON_AUTH_BASE_URL` | Base URL of your Neon Auth instance |
   | `NEON_AUTH_COOKIE_SECRET` | Secret (32+ chars) used to sign Neon Auth session cookies |
   | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 uploads |
   | `AWS_REGION` | AWS region for the S3 bucket |
   | `S3_BUCKET_NAME` | Target S3 bucket for uploaded media |

3. Apply the Prisma schema to your database:

   ```bash
   npm run db:migrate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000). The admin panel is at `/sbh-1111`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create/apply a Prisma migration in development |
| `npm run db:migrate:deploy` | Apply pending migrations in production |
| `npm run db:studio` | Open Prisma Studio against `DATABASE_URL` |

> There is no automated test suite configured in this repo — validate changes with `npm run lint` and `npm run build`.

## Architecture

Every public page follows the same pattern:

```
src/app/<route>/page.tsx           → server component: fetches content from Postgres, passes it down
src/components/<Name>PageClient.tsx → "use client": renders the actual UI/animations
```

Content is fetched through thin query helpers in `src/lib/queries/content.ts` and rendered dynamically on every request (`export const revalidate = 0` — no ISR caching).

### Content model

All content lives in Postgres and is managed through `/sbh-1111`, with no external CMS. Models include `Service`, `ProcessStep`, `CaseStudy`, `Stat`, `Testimonial`, `CommunityEvent`, `PodcastEpisode`, `CommunityWin`, `CommunityPost`, `Blog`, `BrandPartner`, and a singleton `SiteSettings` row.

### Admin panel

Each content type has its own route group under `src/app/sbh-1111/<type>/` (list, create, edit views + server actions). Actions call `verifyAdminSession()` and delegate to generic CRUD helpers in `src/lib/admin/crud.ts`, driven by per-type Zod schemas in `src/lib/admin/schemas/`. The blog section is the one exception, working with structured Tiptap JSON instead of the generic form path.

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`).

## Deployment

The app is deployed on [Vercel](https://vercel.com), with the serverless function region pinned to Mumbai (`bom1`) via `vercel.json` for lower latency to users in India — note this only takes effect on Vercel Pro/Enterprise plans. Run `npm run db:migrate:deploy` against production before deploying schema changes.

## Notes for contributors

- The installed Next.js version (16.2.9) includes breaking changes relative to older docs/training data — check `node_modules/next/dist/docs/` before relying on unfamiliar APIs.
- Two linters are configured but only one runs automatically: `npm run lint` covers ESLint; `.oxlintrc.json` (oxlint) exists but isn't wired into an npm script.
