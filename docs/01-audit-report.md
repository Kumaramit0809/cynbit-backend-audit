# 1. Backend Technical Audit Report

## 1.1 Overview

Cynbit's site looks like a server-rendered Next.js application backed by a relational database (Prisma) with transactional email (Resend). Blog posts, case studies, careers and diaries appear to be database-driven. The public attack surface is mostly form-driven: contact inquiry, newsletter signup, a product demo request and a long job application form.

## 1.2 Observed architecture

| Signal | Evidence | Conclusion |
|---|---|---|
| `meta-next-size-adjust` tag in every page head | Fetched page metadata | Likely **Next.js** (confirm via `/_next/` asset paths in DevTools) |
| Privacy policy names **Prisma** and **Resend** | `/privacy`, section 4 | Prisma ORM over a database; Resend for email delivery |
| Privacy policy mentions "blog comments or diary entries" | `/privacy`, section 3 | Possible user-generated content storage |
| Sitemap entries with timestamps 1-3 ms apart (`2026-05-20T09:19:43.8xx`) | `sitemap.xml` | Blog, careers and diaries rows were bulk-created, so content likely lives in the database |
| Some case studies have hardcoded dates (2024, 2025) | `sitemap.xml` | Mix of seeded database rows and hardcoded entries |
| `cynbit.in/contact` resolves to `www.cynbit.in/contact` | Fetch result | Apex domain redirects to `www` |
| Disallowed paths `/api/`, `/admin/`, `/portal/` | `robots.txt` | Separate API, admin and portal areas exist |
| `Server: Vercel`, `X-Vercel-Cache: HIT`, `X-Vercel-Id: bom1::...` | Homepage response headers | Hosted on **Vercel**; homepage HTML served from the edge cache |
| `Cache-Control: public, max-age=0, must-revalidate` | Homepage response headers | Static or ISR page: edge-cached, browser revalidates each visit |
| Font files named `...-s.p.woff2` | Network tab | Matches `next/font` self-hosting, consistent with Next.js |
| `:authority` / `:method` pseudo-headers | Network tab | HTTP/2 or later |
| `?_rsc=...` prefetch requests on page load | Network tab | Next.js **App Router** (React Server Components) |
| `POST /contact`, form fields `_1_*`, response `Content-Type: text/x-component` | Contact form submission | Forms use **Next.js Server Actions**, not `/api/` routes |
| `Strict-Transport-Security: max-age=63072000`, `Content-Encoding: br` | Contact response headers | HSTS enabled and Brotli compression in use |
| `Vary: rsc, next-router-state-tree, ...` | Contact response headers | Confirms App Router caching variants |

Likely request flow: Browser -> Vercel edge (cache) -> Next.js (SSR and route handlers) -> Prisma -> database, with Resend called from server code for email. The stack is an inference from public signals, not confirmed.

## 1.3 Public write surfaces (observed form fields)

| Form | Fields | Notes |
|---|---|---|
| Contact inquiry (`/contact`) | name, email, company (optional), industry (optional), message | Free-text message |
| Newsletter (footer, every page) | email | Unauthenticated |
| Studio demo request (`/products`) | full name, work email, company, how can we help | Free text |
| Job application (`/careers/backend-developer-intern`) | name, email, phone, WhatsApp, date of birth, gender, qualification, specialization, college, graduation year, status, score, notice period, skills, city, permanent address, resume link, LinkedIn, GitHub (optional), statement, consent | About 20 fields |

## 1.4 Positive observations

- All fetched pages were served over HTTPS, and the apex domain redirects to `www`.
- HSTS is enabled, responses are Brotli-compressed, and the form response is `no-store`, which is correct for a submission.
- The homepage HTML is served from Vercel's edge cache (`X-Vercel-Cache: HIT`), so the main entry page is already fast to serve.
- The application form takes a resume **link** instead of a file upload, which avoids a whole class of upload risks.
- The privacy policy acknowledges access and deletion rights and names its processors.
- Sensitive prefixes are excluded from search indexing.
- A sitemap and robots file exist, with structured priorities and change frequencies.
