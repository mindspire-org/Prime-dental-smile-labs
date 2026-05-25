# Prime Smile Admin Portal — Full Rebuild Plan
> Target: WordPress-level CMS + Elementor-style visual page editor + real-time analytics

---

## Current State Audit

### ✅ Already Built
| Area | What exists |
|---|---|
| Layout | Dark indigo sidebar, nav groups, role guard |
| Dashboard | 8 stat cards, status breakdown, activity feed |
| Cases | Searchable/filterable table, status update modal |
| Users | Create / edit / delete / reset-password |
| Clinics | CRUD modals, case count |
| Content CMS | Key-value store, tab per page, section groups |
| SEO | Meta fields per page, OG tags, noIndex |
| Finance | Monthly bar chart, status/urgency breakdown, top dentists |
| Activity Log | Paginated audit trail |

### ❌ Missing / Weak
| Gap | Priority |
|---|---|
| Visual page editor (Elementor-style drag-drop blocks) | HIGH |
| Real-time analytics (live visitor count, live case events) | HIGH |
| Media library (upload images, use in pages) | HIGH |
| Blog / Posts management | HIGH |
| Notifications & announcements system | HIGH |
| Email template editor | MEDIUM |
| Settings (site name, logo, colors, SMTP, etc.) | HIGH |
| Role & permissions manager | MEDIUM |
| Dentist onboarding flow manager | MEDIUM |
| Pricing / services manager | MEDIUM |
| Testimonials / reviews manager | MEDIUM |
| Analytics: traffic (page views, sessions) | HIGH |
| Analytics: conversion funnel (submit form completions) | MEDIUM |
| Analytics: case throughput / SLA tracking | MEDIUM |
| Dark/light mode toggle for admin | LOW |

---

## Phase 1 — Foundation Fixes (this session)
> These unblock everything else

1. **Admin real-time WebSocket integration** — connect `openRealtimeConnection` to admin dashboard so live case events update stats without refresh
2. **Admin stats auto-refresh** — poll `/api/admin/stats` every 30s + WS push on case events
3. **Settings page** — site name, contact email, logo URL, primary color, SMTP config, maintenance mode
4. **Media library** — file upload endpoint + grid browser used by page editor

---

## Phase 2 — Visual Page Editor (Elementor equivalent)
> Replace flat key/value CMS with a block-based visual editor

### Architecture
- Each page has an ordered array of **blocks** (stored in MongoDB `Content` collection, `type: "block"`)
- Block types: `hero`, `text`, `image`, `image+text`, `cards-grid`, `testimonials`, `cta`, `services-list`, `stats-bar`, `divider`, `video`, `accordion`, `team-grid`
- Editor UI: left panel (block library) + center canvas (live preview) + right panel (block properties)
- Drag-and-drop reorder via `@dnd-kit/sortable`
- Changes saved with PUT `/api/admin/pages/:page/blocks`
- Preview iframe renders the actual marketing page in read-only mode

### New Backend Routes needed
```
GET    /api/admin/pages              → list all editable pages
GET    /api/admin/pages/:slug/blocks → get block array
PUT    /api/admin/pages/:slug/blocks → save full block array
POST   /api/admin/pages/:slug/blocks → add single block
PATCH  /api/admin/pages/:slug/blocks/:blockId → update block props
DELETE /api/admin/pages/:slug/blocks/:blockId → delete block
POST   /api/admin/media              → upload image → S3/local
GET    /api/admin/media              → list uploaded media
DELETE /api/admin/media/:id         → delete media
```

### New Mongoose Models needed
- `Page` — `{ slug, title, blocks: [{ id, type, order, props }], seo: ref, published, updatedBy }`
- `Media` — `{ filename, url, size, mimeType, uploadedBy, createdAt }`

---

## Phase 3 — Real-Time Analytics Dashboard
> Live data visible without refresh

### Metrics tracked
| Metric | Source | Update method |
|---|---|---|
| Active visitors right now | WebSocket heartbeat | WS push every 5s |
| Page views today / this week / month | `PageView` event log | DB aggregation |
| Current pages being viewed | WS client registry | Server push |
| Case submissions today | DB query | WS on `case.created` |
| New users today | DB query | WS on `user.created` |
| Average case processing time | DB aggregation | Refresh every 5min |
| SLA breach alerts (cases > 7 days in same status) | DB cron | WS push |
| Top referrer pages | `PageView` log | Aggregation |

### New Backend needed
```
GET  /api/admin/analytics/realtime   → active users, page distribution
GET  /api/admin/analytics/pageviews  → daily/weekly/monthly breakdown
GET  /api/admin/analytics/funnel     → submit page → form completion rate
GET  /api/admin/analytics/sla        → cases breaching SLA
```

### New Model needed
- `PageView` — `{ path, referrer, sessionId, userAgent, country, createdAt }`
- Middleware to log page views from SSR render

### Frontend components needed
- `<LiveCounter />` — pulsing number that updates via WS
- `<RealtimeVisitorMap />` — list of active pages with visitor count
- `<SparklineChart />` — mini inline trend chart per metric
- `<SlaAlerts />` — warning banner for breached cases
- Charts: recharts `AreaChart` for page views over time

---

## Phase 4 — Content & Blog Management
> WordPress Posts equivalent

### Posts system
- `Post` model: `{ title, slug, content (blocks), excerpt, featuredImage, status (draft/published/scheduled), publishedAt, author, tags, category }`
- Admin routes: full CRUD + publish/unpublish/schedule
- Frontend admin pages: posts list, post editor (reuses block editor from Phase 2)

### Pages for this
- `/admin/posts` — posts list with filters (status, category, date)
- `/admin/posts/new` — create post (block editor)
- `/admin/posts/:id` — edit post
- `/admin/categories` — tag/category manager

---

## Phase 5 — Additional CMS Features

### Notifications & Announcements
- `Notification` model: `{ title, body, type (info/warning/success), targetRole, startAt, endAt, active }`
- Shows banner in dentist portal if active notification exists
- Admin page: create/schedule/disable announcements

### Testimonials Manager
- `Testimonial` model: `{ name, clinic, text, rating, photo, approved, order }`
- Admin page: approve, reorder, edit

### Services / Pricing Manager
- `Service` model: `{ slug, name, description, price, turnaround, icon, order, active }`
- Admin page: edit services that appear on marketing site

### Email Template Editor
- `EmailTemplate` model: `{ key, subject, htmlBody, variables }`
- Admin page: edit transactional email templates (case submitted, status changed, account created)

### Settings Page
- `Setting` model: `{ key, value, type, group }` — key-value store
- Groups: `general` (site name, tagline, logo), `contact` (email, phone, address), `smtp`, `features` (flags), `appearance` (primary color, font)
- Admin page: grouped form fields with save per section

---

## Phase 6 — Roles & Permissions
- Granular permissions beyond current 3 roles
- `lab_staff` sub-roles: `production`, `design`, `dispatch`
- Per-role access to cases by stage
- Admin can configure which statuses each sub-role can set

---

## Implementation Order

```
Week 1:
  [x] Fix hydration bugs (done)
  [ ] Phase 1: Settings page + media upload backend
  [ ] Phase 3: Analytics backend (pageview tracking middleware + routes)
  [ ] Phase 3: Real-time analytics frontend (live counters, charts)

Week 2:
  [ ] Phase 2: Page editor backend (Page model, block routes)
  [ ] Phase 2: Block editor UI (drag-drop canvas)

Week 3:
  [ ] Phase 4: Posts/Blog system
  [ ] Phase 5: Testimonials + Services managers

Week 4:
  [ ] Phase 5: Notifications system
  [ ] Phase 5: Email template editor
  [ ] Phase 6: Roles & permissions
```

---

## New Files to Create

### Backend
| File | Purpose |
|---|---|
| `backend/models/Page.js` | Page + blocks schema |
| `backend/models/Media.js` | Uploaded media |
| `backend/models/PageView.js` | Analytics event log |
| `backend/models/Post.js` | Blog posts |
| `backend/models/Notification.js` | Announcements |
| `backend/models/Testimonial.js` | Testimonials |
| `backend/models/Service.js` | Services/pricing |
| `backend/models/EmailTemplate.js` | Email templates |
| `backend/models/Setting.js` | Site settings |
| `backend/routes/pages.js` | Block editor API |
| `backend/routes/media.js` | Media upload/list |
| `backend/routes/analytics.js` | Analytics API |
| `backend/routes/posts.js` | Blog CRUD |
| `backend/middleware/pageview.js` | Auto-log page views |

### Frontend Routes
| File | Route | Purpose |
|---|---|---|
| `admin.settings.tsx` | `/admin/settings` | Site settings grouped form |
| `admin.media.tsx` | `/admin/media` | Media library grid |
| `admin.analytics.tsx` | `/admin/analytics` | Real-time + historical analytics |
| `admin.pages.tsx` | `/admin/pages` | Page list |
| `admin.pages.$slug.tsx` | `/admin/pages/:slug` | Block editor canvas |
| `admin.posts.tsx` | `/admin/posts` | Posts list |
| `admin.posts.$id.tsx` | `/admin/posts/:id` | Post editor |
| `admin.services.tsx` | `/admin/services` | Services/pricing manager |
| `admin.testimonials.tsx` | `/admin/testimonials` | Testimonials manager |
| `admin.notifications.tsx` | `/admin/notifications` | Announcements manager |
| `admin.emails.tsx` | `/admin/emails` | Email template editor |
| `admin.roles.tsx` | `/admin/roles` | Role & permissions |

---

## npm packages needed
```
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities   ← drag-drop for block editor
recharts                                              ← analytics charts (already likely present)
multer                                                ← file upload backend
sharp                                                 ← image resize/optimize
```
