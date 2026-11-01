# 2. Security & Performance Findings

Severity is my own judgement for a public marketing and recruiting site. Nothing here was exploited or confirmed beyond public output.

## Security

### F1. `robots.txt` discloses sensitive route prefixes (Low, Observed)
`robots.txt` contains `Disallow: /api/`, `Disallow: /admin/` and `Disallow: /portal/`. It only asks well-behaved crawlers to stay away. It is public and does not restrict access, so it hands anyone a map of internal areas.
**Risk:** if those areas rely on obscurity rather than authentication, the impact is serious.
**Fix:** enforce authentication (R3) and use an `X-Robots-Tag: noindex` header instead of listing them (R1).
**Note:** the contact form does not post to `/api/` (it is a Server Action posting to `/contact`), so the `/api/` entry may be vestigial or for other features.

### F3. Technology stack disclosed in public documents (Informational, Observed)
The privacy policy names Prisma and Resend, and page metadata hints at Next.js. Disclosure alone is not a vulnerability, but it lets an attacker target known issues in those components.
**Fix:** keep dependencies patched, avoid naming internals in public documents, set `poweredByHeader: false` (R1).

### F9. Some common security headers absent from observed responses (Low, Observed)
On the contact form response, `Strict-Transport-Security: max-age=63072000` **is present**. `Content-Security-Policy`, `Permissions-Policy` and `Referrer-Policy` response headers are **not** present. `X-Content-Type-Options` and `X-Frame-Options` could not be seen because the capture was cut off (see [04-evidence.md](04-evidence.md) section 4.4).
The earlier homepage capture listed no HSTS or `Content-Type`; that capture was incomplete (likely a 304 revalidation), so the contact response is the more reliable evidence.
**Risk:** no CSP weakens XSS defence; a missing `X-Frame-Options` or `frame-ancestors` would allow clickjacking.
**Fix:** R1 (add CSP, `nosniff`, frame protection, Permissions-Policy; consider `includeSubDomains; preload` on HSTS).

## Data validation, authentication and error handling

### F6. Public form submits as a Next.js Server Action; controls unverified (Medium, Observed design, controls To verify)
The contact form sends `POST /contact` with multipart form fields (`_1_fullName`, `_1_email`, `_1_company`, `_1_industry`, `_1_message`) and receives `Content-Type: text/x-component` with status 200 (see section 4.4 of the evidence). This is the Next.js Server Action pattern. Other forms (newsletter, studio demo, job application) very likely work the same way.
Because the endpoint shares the page URL and always answers 200 on success, validation failures and abuse do not show up as distinct HTTP status codes unless the action returns a typed result. The typical risks for a public write path remain:
- missing **server-side validation** (client-side validation alone is bypassable)
- no **rate limiting or bot protection**, enabling spam, database growth and email-quota exhaustion (a WAF rule must target `POST /contact`, not `/api/`)
- **email header or content injection** if user input reaches email headers or HTML
- **inconsistent or opaque error handling** inside the action
- **duplicate submissions** (no idempotency)

On success the action returns only `{"success":true}` (see the response-body evidence). I submitted the form once with valid test data and did not test the error path or any of the risks above. **Fix:** R2.

### F7. User-generated content (Medium, To verify)
The privacy policy refers to blog comments and diary entries stored in the system. I did not observe a public submission form for them. If one exists, stored XSS, moderation and sanitisation need attention.
**Fix:** escape on output, validate length and type on input, moderate before publishing.

## Data handling

### F2. Application form collects more personal data than the privacy policy promises (Medium, Observed)
The privacy policy says Cynbit collects "the minimum information necessary... typically your name, email, and professional context". The application form requires phone, **WhatsApp**, **date of birth**, **gender** and **permanent address**, among others. These are not needed to screen an internship candidate, and they raise breach impact and compliance exposure (India's DPDP Act, 2023, emphasises purpose limitation and data minimisation; this is a design observation, not legal advice). No retention period is stated.
**Fix:** collect only what screening needs, request the rest at offer stage, and enforce retention (R5).

### F8. Contact details exposed in plain text (Informational, Observed)
Two email addresses and three phone numbers appear in every footer. Normal for a company site, but easy to scrape.
**Fix:** optional. Prefer the contact form for first contact and use role-based aliases.

## Performance and architecture

### F4. Metadata and host inconsistencies (Low, Observed)
- Every page fetched (`/`, `/contact`, `/privacy`, `/careers/backend-developer-intern`) sets `og:url` to `https://cynbit.in` instead of its own URL.
- The sitemap and `robots.txt` use the apex host while the site serves from `www` after a redirect, so each sitemap URL costs crawlers an extra hop.
- The footer links to `/navigation`, which is not in the sitemap.
**Risk:** misattributed canonical signals, wasted crawl budget, wrong link previews.
**Fix:** R4.

### F5. Sitemap `lastmod` is not content-driven (Low, Observed)
All static pages share `2026-10-31T16:15:08.277Z`, so it is generated at request time. Crawlers cannot tell what changed, and the sitemap seems to be rebuilt on every request.
**Fix:** use `updatedAt` per record, a build-time constant for static pages, and cache the sitemap (R4, R6).

### F10. Third-party requests and icon-font weight (Low, Observed; size to verify)
The homepage loads a Google Analytics tag and a Google Fonts stylesheet for the **Material Symbols Outlined** icon font with the full variable range (`wght,FILL@100..700,0..1`). Loading the full variable icon font for a handful of icons is typically heavy, and it adds a third-party round trip before icons render. File sizes were not visible in the capture.
The privacy policy's third-party section lists only Resend and Prisma; it does not mention analytics or font providers.
**Fix:** request only the icons used (`icon_names=` parameter) or switch to inline SVG icons, self-host fonts with `next/font`, load analytics after consent and `afterInteractive`, and list analytics in the privacy policy (R8).

### F11. Server Action response carries the full re-rendered route payload (Informational, Observed)
After a successful submit, the response includes the refreshed page tree and a list of build chunk paths and route group names (for example `(marketing)`), not just the result. This is default Server Action behaviour. The payload was small and everything it names is already public in the client bundle, so the impact is negligible.
**Fix:** none required; for write-only forms, avoid unnecessary revalidation so responses stay minimal (R2).
