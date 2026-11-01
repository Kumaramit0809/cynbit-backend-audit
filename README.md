# Backend Technical Audit: cynbit.in

Assessment: Backend Developer Intern, "Analyze Cynbit From a Backend Perspective".
Author: Amit Kumar. Date: 31 Oct 2026.

## Contents

| File | Deliverable |
|---|---|
| [docs/01-audit-report.md](docs/01-audit-report.md) | Backend Technical Audit Report (scope, method, observed architecture) |
| [docs/02-findings.md](docs/02-findings.md) | Security & Performance Findings (F1-F11, categorized) |
| [docs/03-recommendations.md](docs/03-recommendations.md) | Recommended Improvements (R1-R8) |
| [snippets/](snippets/) | Architectural code snippets referenced by the recommendations |
| [docs/04-evidence.md](docs/04-evidence.md) | DevTools evidence and screenshots (passive observations) |
| [SETUP_NOTES.md](SETUP_NOTES.md) | Technical setup notes |

## Scope and rules followed

Only passive methods were used: public pages, `robots.txt`, `sitemap.xml`, page metadata and form structure. No requests to `/api/`, `/admin/` or `/portal/`, no fuzzing, no tampering, no load generation, no scanners, and no attempt to access any non-public resource.

Each finding is marked **Observed** (seen directly in public output, including DevTools) or **To verify** (a design risk that needs response-level evidence).

## Summary

| ID | Finding | Category | Severity | Status |
|---|---|---|---|---|
| F1 | `robots.txt` discloses `/api/`, `/admin/`, `/portal/` | Security | Low | Observed |
| F2 | Job application collects more PII than the privacy policy promises | Data handling | Medium | Observed |
| F3 | Technology stack disclosed in public documents | Security | Informational | Observed |
| F4 | Every page's `og:url` points to the homepage; apex-to-www mismatch | Architecture / SEO | Low | Observed |
| F5 | Sitemap `lastmod` is generated per request, not from content | Performance | Low | Observed |
| F6 | Forms are Next.js Server Actions; validation and abuse controls unverified | Validation / security | Medium | Observed design, controls to verify |
| F7 | User-generated content (comments, diary entries) | Validation / security | Medium | To verify |
| F8 | Contact details exposed in plain text | Data handling | Informational | Observed |
| F9 | CSP, Permissions-Policy, Referrer-Policy headers absent (HSTS present) | Security | Low | Observed |
| F10 | Third-party requests and icon-font weight; analytics not in privacy policy | Performance / privacy | Low | Observed (size to verify) |
| F11 | Server Action response carries the full re-rendered route payload | Architecture | Informational | Observed |
