# Technical Setup Notes

This repository is a **documentation and reference-snippet submission**, not a runnable application. It analyses a third-party public website, so there is no code of Cynbit's to run against.

## How to read it
1. Start with `README.md` for scope and the findings summary.
2. `docs/01-audit-report.md` for architecture, `docs/02-findings.md` for categorized findings, `docs/03-recommendations.md` for improvements.
3. `snippets/` holds the code for each recommendation.

## How the snippets would be applied
Stack: hosting on Vercel is observed in response headers; Next.js, Prisma and Resend are inferred from page metadata, font file naming and the privacy policy.

```bash
npm i zod @upstash/ratelimit @upstash/redis resend jose
```

Environment variables used by the snippets (set in the hosting platform's secret store, never `NEXT_PUBLIC_`):
`RESEND_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

Copy each snippet to the path in its first comment, adapt model names to the real Prisma schema, run `npx prisma migrate dev` for the schema change, then test with `curl` against a local or staging instance only.

## Testing approach
All observation was passive: public pages, `robots.txt`, `sitemap.xml`, metadata and normal browser use. No exploitation, fuzzing, tampering or load generation. No request was made to `/api/`, `/admin/` or `/portal/`.
