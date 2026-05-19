# Hotel Management App — Start Here

**Project:** Teja Hotel — multi-module hotel operations (Restaurant, Hotel Room, Banquet planned)  
**Stack:** React 19 admin (`admin/`) + Laravel 9 API (`backend/`) + MySQL  
**Use this file** as the entry point for developers and AI agents. It points to **what to read** in `scope/` and `structure & development guideline/` — not a duplicate of those docs.

For setup commands, see the root [README.md](README.md).

---

## Repository layout

```
Hotel-App/
├── admin/                              # React admin panel (Vite)
├── backend/                            # Laravel API
├── scope/                              # Product scope, modules, feature specs
├── structure & development guideline/  # How to build: structure, API, DB, deploy
├── PROJECT_START_HERE.md               # This file
└── README.md                           # Quick start (install, migrate, run)
```

---

## Documentation map

### When to read what

| Goal | Read first |
|------|------------|
| Understand **what** we build (client scope) | `scope/Scope - Hotel Management.md` |
| See **module completion** status | `scope/ProjectModules.md` |
| Build **restaurant POS** UI/flow | `scope/POS_Panel_Specification.md` |
| Build **room booking POS** UI/flow | `scope/Room_Booking_POS_Panel_Specification.md` |
| Plan **room module** pages/APIs | `scope/Room_Management_Plan.md` |
| **Switch modules** in the app (nav, routes) | `scope/Multi_Module_Navigation_Plan.md` |
| **Frontend** folders, components, permissions | `structure & development guideline/admin_project_Structure.md` |
| **Backend** folders, controllers, services | `structure & development guideline/backend_project_structure.md` |
| Call APIs from React | `structure & development guideline/API_Integration.md` |
| Tables, relationships, migrations | `structure & development guideline/DATABASE.md` |
| Uploads (avatars, logos, food items) | `structure & development guideline/IMAGE_UPLOAD_HANDLING.md` |
| Reports module rules | `structure & development guideline/REPORTS_REQUIREMENTS.md` |
| Deploy to Hostinger | `structure & development guideline/HOSTINGER_DEPLOYMENT.md` |

---

## `scope/` — product & features

Business requirements, module plans, and detailed UI specs. **Authoritative for “what”**; implementation status may lag — cross-check `ProjectModules.md`.

| File | Purpose |
|------|---------|
| **[Scope - Hotel Management.md](scope/Scope%20-%20Hotel%20Management.md)** | Client-facing scope: **Phase 1** (Restaurant MVP) and **Phase 2** (Room Management MVP). Fixed business rules, module lists, out-of-scope items. |
| **[ProjectModules.md](scope/ProjectModules.md)** | Living **module checklist** (frontend / backend / DB / status). Start here for “is X done?” |
| **[POS_Panel_Specification.md](scope/POS_Panel_Specification.md)** | Restaurant **dine-in POS**: tables, bills, payments, thermal print behaviour. |
| **[Room_Management_Plan.md](scope/Room_Management_Plan.md)** | Phase 2 **room module** breakdown: categories, rooms, addons, bookings, laundry, billing, reports. |
| **[Room_Booking_POS_Panel_Specification.md](scope/Room_Booking_POS_Panel_Specification.md)** | **Front-desk POS**: room grid, booking modal, timeline, filters, linked bills, business rules, implementation status / next steps. |
| **[Multi_Module_Navigation_Plan.md](scope/Multi_Module_Navigation_Plan.md)** | **Multi-module shell**: Restaurant / Hotel Room / Banquet, route prefixes, shared vs module menus, permissions. |

### Phases (high level)

| Phase | Focus | Primary scope docs |
|-------|--------|-------------------|
| **1 — Restaurant** | Menu, tables, POS, bills, staff, expenses, reports | `Scope - Hotel Management.md` (Phase 1), `POS_Panel_Specification.md` |
| **2 — Hotel Room** | Room master, booking, check-in/out, room billing | `Scope - Hotel Management.md` (Phase 2), `Room_Management_Plan.md`, `Room_Booking_POS_Panel_Specification.md` |
| **3 — Banquet** | Planned | `Multi_Module_Navigation_Plan.md` (navigation only for now) |

---

## `structure & development guideline/` — how to build

Coding standards, project layout, integration patterns, and ops. **Authoritative for “how”** in this repo.

| File | Purpose |
|------|---------|
| **[admin_project_Structure.md](structure%20&%20development%20guideline/admin_project_Structure.md)** | React app tree: `views/`, `components/pages/`, services, hooks, permissions, multi-module routes, common components. |
| **[backend_project_structure.md](structure%20&%20development%20guideline/backend_project_structure.md)** | Laravel tree: controllers, services, repositories, requests, resources, middleware, module organisation. |
| **[API_Integration.md](structure%20&%20development%20guideline/API_Integration.md)** | API base URL (`VITE_API_BASE_URL`), auth token (`access_token`), request/response patterns, error handling, pagination. |
| **[DATABASE.md](structure%20&%20development%20guideline/DATABASE.md)** | Schema overview: core, restaurant, room tables; relationships; migration notes. |
| **[IMAGE_UPLOAD_HANDLING.md](structure%20&%20development%20guideline/IMAGE_UPLOAD_HANDLING.md)** | Upload flow, storage paths (`avatars/`, `logos/`, `food-items/`), URLs, validation, frontend + backend. |
| **[REPORTS_REQUIREMENTS.md](structure%20&%20development%20guideline/REPORTS_REQUIREMENTS.md)** | Reports module: types, filters, exports, permissions. |
| **[HOSTINGER_DEPLOYMENT.md](structure%20&%20development%20guideline/HOSTINGER_DEPLOYMENT.md)** | Production deploy: `/admin` SPA + `/admin/api` Laravel, build, `.env`, migrations, troubleshooting. |

---

## Suggested reading order

### New to the project

1. [README.md](README.md) — run locally  
2. This file — doc map  
3. [scope/ProjectModules.md](scope/ProjectModules.md) — what exists today  
4. [admin_project_Structure.md](structure%20&%20development%20guideline/admin_project_Structure.md) + [backend_project_structure.md](structure%20&%20development%20guideline/backend_project_structure.md)  
5. [API_Integration.md](structure%20&%20development%20guideline/API_Integration.md) + [DATABASE.md](structure%20&%20development%20guideline/DATABASE.md)

### Working on a feature

1. Relevant **scope** spec (POS or Room Booking POS, etc.)  
2. **ProjectModules** row for that module  
3. **Structure** guidelines for the layer you touch  
4. **DATABASE** / **API_Integration** if touching schema or endpoints  

### Deploying

1. [HOSTINGER_DEPLOYMENT.md](structure%20&%20development%20guideline/HOSTINGER_DEPLOYMENT.md)  
2. `admin/.env.production` (`VITE_API_BASE_URL=/admin/`)  
3. `admin/hostinger.htaccess` → server `public_html/admin/.htaccess`

---

## Conventions (quick reference)

| Topic | Convention |
|-------|------------|
| API base (local) | `http://localhost:8000` → requests go to `/api/...` (see `admin/src/config.js`) |
| API base (prod) | `VITE_API_BASE_URL=/admin/` → same-origin `/admin/api/...` |
| Auth token | `localStorage` key **`access_token`** |
| Permissions | Route guards + backend middleware; module-specific permission names |
| Modules in UI | Paths like `/restaurant/...`, `/hotel-room/...` (see Multi_Module plan) |

---

## Active work areas (check specs for detail)

- **Restaurant:** largely complete per `ProjectModules.md`; dashboard may still be pending.  
- **Hotel Room:** room categories & rooms CRUD done; **Room Booking POS** has UI + mock state — see `Room_Booking_POS_Panel_Specification.md` (Implementation Status / What’s Next) for API and polish.  
- **Banquet:** not started — navigation plan only.

Always prefer **spec + structure docs** over guessing from old code or obsolete notes.

---

## Document maintenance

| Action | Where |
|--------|--------|
| Change **business rules** or UI behaviour | Update the relevant file under `scope/` |
| Change **folder patterns** or API patterns | Update `structure & development guideline/` |
| Update **completion status** | `scope/ProjectModules.md` |
| Add a new major doc | Add a row to the tables in **this file** |

---

**Last updated:** May 2026 — replaces legacy `HOTEL_MANAGEMENT_PLAN.md` (Photo Studio migration plan; no longer maintained).
