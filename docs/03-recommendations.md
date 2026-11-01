# 3. Recommended Improvements

Snippets assume the likely stack (Next.js App Router, Prisma, Resend) and live in [`/snippets`](../snippets). Adjust names to the real codebase.

| ID | Improvement | Addresses | Snippet |
|---|---|---|---|
| R1 | Security headers, `poweredByHeader: false`, `X-Robots-Tag` on admin | F1, F3, F9 | [next.config.js](../snippets/next.config.js) |
| R2 | Validated, rate-limited Server Action with typed results and honeypot | F6 | [contact-action.ts](../snippets/contact-action.ts) |
| R3 | Real authentication and role checks for admin, portal and admin API | F1 | [middleware.ts](../snippets/middleware.ts) |
| R4 | Canonical host, per-page canonical/`og:url`, content-driven cached sitemap | F4, F5 | [sitemap.ts](../snippets/sitemap.ts), [careers-metadata.ts](../snippets/careers-metadata.ts) |
| R5 | Data minimisation and retention for applications | F2 | [schema.prisma](../snippets/schema.prisma), [retention-cron.ts](../snippets/retention-cron.ts) |
| R6 | ISR and cache headers for database-driven pages | F5 | [caching.ts](../snippets/caching.ts) |
| R7 | Structured errors and observability | F6 | see below |
| R8 | Lighter third-party and icon loading, disclose analytics | F10 | see below |

## Notes per recommendation

**R1.** HSTS is already present; the main gaps are CSP, `nosniff`, frame protection and Permissions-Policy. A nonce-based CSP (instead of `'unsafe-inline'`) is the stronger next step.

**R2.** The form is a Next.js Server Action, so validation lives in the action, not in an `/api` route. Server Actions answer HTTP 200 even when validation fails, so return a typed result object and log failures server-side; status codes alone will not show errors in monitoring. On success the action currently returns only a boolean; return a small typed result with an error code for failures. Add a CAPTCHA (Cloudflare Turnstile or hCaptcha) on the job application and newsletter forms. Send email asynchronously (queue or background job) so a slow provider never blocks the request. User input must never reach email headers.

**R3.** Session cookie flags: `HttpOnly; Secure; SameSite=Lax`, short expiry, rotation on login. After this is in place, remove the sensitive prefixes from `robots.txt`.

**R4.** Pick one canonical host (`www`), use it in the sitemap, `robots.txt` and metadata, and keep the apex-to-www redirect permanent (301).

**R5.** Collect date of birth, gender and permanent address at offer stage only. Publish the retention period in the privacy policy and document a process for access and deletion requests.

**R6.** The homepage is already edge-cached (`X-Vercel-Cache: HIT`); apply the same ISR approach to blog, careers and diaries lists and to the sitemap. Also paginate list endpoints (cursor-based), index `slug` and `updatedAt`, and use Prisma `select` so list pages never load full article bodies.

**R7.**
- Return one error shape (RFC 7807 `application/problem+json`) from every endpoint, with no stack traces in production.
- Attach a request ID (`x-request-id`) to every response and log line.
- Log validation failures and rate-limit hits as metrics, and alert on spikes.
- Keep secrets (`RESEND_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`) in the platform secret store, never in client bundles (no `NEXT_PUBLIC_` prefix).

**R8.**
- Request only the icons in use: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names=home,mail,school&display=swap`, or replace the font with inline SVG icons.
- Self-host fonts with `next/font` so no extra third-party origin sits on the critical path.
- Load analytics with `next/script` `strategy="afterInteractive"` and only after consent.
- Name analytics and font providers in the privacy policy's third-party section.
