# Hostinger Deployment Guide

Deploy the **Hotel Management App** (React admin + Laravel API) on Hostinger using a single domain with path-based routing: admin UI at `/admin` and API at `/admin/api`.

**Project:** Teja Hotel — restaurant POS, room booking, billing, reports, and shared modules (customers, staff, expenses).

---

## Domain mapping

Replace `yourdomain.com` with your actual domain.

| Host / Path | Document root (Hostinger) | Contents |
|-------------|---------------------------|----------|
| `yourdomain.com` | `public_html/` | Marketing / landing (optional) |
| `yourdomain.com/admin` | `public_html/admin/` | React admin build + `.htaccess` |
| `yourdomain.com/admin/api` | `public_html/admin/api/` | Laravel backend (full project) |
| | `public_html/admin/api/public/` | Laravel `public/` (`index.php`) |

**Same-origin setup:** Admin loads at `https://yourdomain.com/admin` and the API at `https://yourdomain.com/admin/api/*`. No CORS configuration is required when using `VITE_API_BASE_URL=/admin/` in production.

---

## 1. Folder structure on server

```
public_html/
└── admin/
    ├── index.html              # React SPA entry (from admin/dist/)
    ├── assets/                 # Vite build assets
    ├── .htaccess               # Copy from admin/hostinger.htaccess
    └── api/                    # Entire backend/ folder (not vendor/)
        ├── app/
        ├── bootstrap/
        ├── config/
        ├── database/
        ├── public/
        │   ├── index.php       # Custom storage handler for /admin/api/storage/*
        │   └── .htaccess
        ├── resources/
        ├── routes/
        ├── storage/
        ├── artisan
        ├── composer.json
        └── composer.lock
```

---

## 2. Backend (Laravel API)

### What to upload

**Upload** the full `backend/` folder to `public_html/admin/api/` **except:**

| Upload | Do not upload |
|--------|----------------|
| `app/`, `bootstrap/`, `config/`, `database/`, `public/`, `resources/`, `routes/`, `storage/`, `artisan`, `composer.json`, `composer.lock` | `vendor/` — run `composer install` on server |
| | `tests/`, `.env`, `node_modules/`, `.git/` |

### Storage folder

- Upload `storage/` structure (`framework/`, `logs/`, `app/public/`).
- Optional: keep existing uploads under `storage/app/public/`:
  - `avatars/` — user profile images
  - `logos/` — business logo
  - `food-items/` — menu item images
- Files are served at `https://yourdomain.com/admin/api/storage/{path}` via the custom handler in `public/index.php` (no `storage:link` symlink required on shared hosting).

### Server setup (SSH / Hostinger Terminal)

```bash
cd ~/public_html/admin/api

composer install --no-dev --optimize-autoloader

php artisan key:generate

# Fresh database (development/staging only — destroys data):
# php artisan migrate:fresh --force
# php artisan db:seed --force

# Production (keeps data, runs pending migrations):
php artisan migrate --force
php artisan db:seed --force

php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Permissions

```bash
cd ~/public_html/admin/api
chmod -R 755 storage bootstrap/cache
chown -R $(whoami):$(whoami) storage bootstrap/cache
```

On Hostinger, use your panel username/group if `chown` fails (e.g. `u123456789:o123456789` from `whoami` / `id`).

### Backend `.env` (create on server)

Copy `backend/.env.development` or create `public_html/admin/api/.env` manually. **Never commit production secrets.**

```env
APP_NAME="Hotel Management App"
APP_ENV=production
APP_KEY=base64:***GENERATE_WITH_php_artisan_key:generate***
APP_DEBUG=false
APP_URL=https://yourdomain.com/admin
FRONTEND_URL=https://yourdomain.com/admin

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

---

## 3. Frontend (React admin)

### Local build

1. Copy and edit production env:
   ```bash
   cd admin
   cp .env.example .env.production
   ```
   Ensure:
   ```env
   VITE_API_BASE_URL=/admin/
   VITE_APP_NAME="Hotel Management App"
   VITE_APP_ENVIRONMENT=production
   VITE_ENABLE_DEBUG=false
   ```
   (`src/config.js` resolves `/admin/` → API base `https://yourdomain.com/admin/api`.)

2. Build:
   ```bash
   npm install
   npm run build:prod
   ```

3. Upload **contents** of `admin/dist/` into `public_html/admin/` (next to the `api/` folder).

4. Copy `admin/hostinger.htaccess` → `public_html/admin/.htaccess` after upload. It:
   - Routes `/admin/api/*` → `api/public/index.php`
   - Serves static assets when files exist
   - Falls back to `index.html` for React Router (SPA)

### Env files reference (admin)

| File | Use |
|------|-----|
| `.env.example` | Template |
| `.env.local` | Local dev (`npm run dev`) — `VITE_API_BASE_URL=http://localhost:8000` |
| `.env.staging` | `npm run build:staging` |
| `.env.production` | `npm run build:prod` — `VITE_API_BASE_URL=/admin/` |

---

## 4. Root domain (`yourdomain.com`)

Optional redirect to admin in `public_html/index.php`:

```php
<?php
header('Location: https://yourdomain.com/admin');
exit;
```

Or host a separate marketing site in `public_html/`.

---

## 5. SSL and security

1. Enable SSL for `yourdomain.com` in Hostinger → Websites → SSL (covers `/admin` and `/admin/api`).
2. Use `https://` in `APP_URL`, `FRONTEND_URL`, and all public links.
3. Set `APP_DEBUG=false` in production.
4. Restrict file permissions on `storage/` and never expose `.env`.

---

## 6. Post-deploy checklist

- [ ] `https://yourdomain.com/admin` loads the login page (no console errors).
- [ ] `https://yourdomain.com/admin/api/auth/login` responds (Postman/curl with JSON body).
- [ ] Admin login works (token stored as `access_token` in browser).
- [ ] Sample API: `/admin/api/auth/user` with Bearer token.
- [ ] Restaurant module: menu, tables, POS (if enabled).
- [ ] Hotel Room module: rooms, room booking POS (if enabled).
- [ ] Uploads work: `/admin/api/storage/avatars/`, `logos/`, `food-items/`.
- [ ] React refresh on deep links (e.g. `/admin/hotel-room/booking-pos`) does not 404 — `.htaccess` SPA fallback.
- [ ] Cron optional: `* * * * * cd ~/public_html/admin/api && php artisan schedule:run` (if scheduled tasks added later).
- [ ] Database and `storage/` backups configured in Hostinger.

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on API | Check `public_html/admin/api/storage/logs/laravel.log`; verify `.env`, `APP_KEY`, DB credentials, permissions. |
| API 404 | Confirm `public_html/admin/.htaccess` exists and routes `api/*` to `api/public/index.php`. |
| React route 404 on refresh | `.htaccess` must rewrite non-file requests to `index.html`. |
| CORS errors | Use `VITE_API_BASE_URL=/admin/` (same domain). Rebuild frontend after env change. |
| Wrong API URL in browser | Rebuild with `.env.production`; clear browser cache. |
| Upload / image 404 | `chmod -R 755 storage`; ensure `storage/app/public/{avatars,logos,food-items}/` exist; test `/admin/api/storage/...`. |
| DB connection refused | Check Hostinger MySQL host (often `localhost`), database name, user privileges. |
| Migration errors | Run `php artisan migrate --force`; for empty DB only, `migrate:fresh --force` then `db:seed --force` (wipes data). |

---

## 8. Release tips

- Keep a zip of `admin/dist` and `admin/api` (without `vendor/`) for quick re-upload.
- After each release: upload changed files → `composer install` if `composer.lock` changed → `php artisan migrate --force` → `php artisan config:cache` → `php artisan route:cache`.
- Document manual steps per release (migrations, seeders, env changes).

---

## Benefits of this layout

- **No CORS** — Frontend and API share one origin  
- **Single SSL certificate** — One domain, path-based API  
- **Shared hosting friendly** — Storage served without symlinks  
- **Matches local dev** — Same `/api` prefix pattern as `http://localhost:8000/api`

---

**Related docs:** `admin_project_Structure.md`, `API_Integration.md`, `DATABASE.md`, `IMAGE_UPLOAD_HANDLING.md`, project root `README.md`.
