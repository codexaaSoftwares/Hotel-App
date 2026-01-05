# Setup Guide

## Prerequisites

- PHP >= 8.0.2
- Composer
- MySQL 5.7+ or MariaDB 10.3+
- Node.js & NPM (optional, for frontend assets)

## Installation Steps

### 1. Install Dependencies

```bash
composer install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials
- Application URL
- Mail settings (optional)
- AWS S3 settings (optional)

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Database Setup

Create your database:

```sql
CREATE DATABASE photo_studio;
```

Update `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=photo_studio
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed Database

This will create:
- Default roles (admin, manager, staff)
- System permissions
- Admin user (email: admin@example.com, password: password)

```bash
php artisan db:seed
```

### 7. Start Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## Testing the API

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

Response:
```json
{
  "token": "1|...",
  "user": {...},
  "permissions": [...],
  "permissionsByModule": {...}
}
```

### Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Permission Issues

If you encounter permission issues with storage:

```bash
chmod -R 775 storage bootstrap/cache
```

### Composer Issues

If composer install fails, try:

```bash
composer install --no-scripts
composer dump-autoload
```

### Database Connection Issues

- Verify database credentials in `.env`
- Ensure MySQL service is running
- Check database exists

## Next Steps

1. Update admin password after first login
2. Configure email settings via API or database
3. Configure S3 settings if using file storage
4. Add your business-specific modules

