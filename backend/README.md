# Hotel Management - Backend API

Laravel 9 REST API backend for Hotel Management System.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
composer install
```

### 2. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure Database
Update `.env` with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hotel_management
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Migrations & Seeders
```bash
php artisan migrate
php artisan db:seed
```

### 5. Start Development Server
```bash
php artisan serve
```

API will be available at [http://localhost:8000/api](http://localhost:8000/api)

## 📦 Tech Stack

- **Laravel 9** - PHP framework
- **MySQL** - Database
- **Laravel Sanctum** - API authentication
- **DomPDF** - PDF generation
- **Guzzle** - HTTP client

## 🔐 Default Admin Credentials

- **Email:** admin@example.com
- **Password:** password

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile

### Roles & Permissions
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}/permissions` - Update role permissions
- `GET /api/permissions` - List permissions

### Settings
- `GET /api/settings` - Get settings
- `POST /api/settings/{group}` - Update settings group
- `POST /api/settings/test-email` - Test email configuration

### Financial Management
- `GET /api/financial-transactions` - List transactions
- `POST /api/financial-transactions` - Create transaction
- `GET /api/financial-categories` - List categories

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/financial-summary` - Financial summary

## 🔧 Services

- **EmailService** - Email sending with database-driven SMTP configuration
- **PdfExportService** - PDF generation and export

## 📝 Development

- **Serve**: `php artisan serve`
- **Migrate**: `php artisan migrate`
- **Seed**: `php artisan db:seed`
- **Test**: `php artisan test`

---

**Status**: In Development  
**Version**: 1.0.0
