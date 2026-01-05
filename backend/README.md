# Photo Studio Management - Backend API

Laravel 9 REST API backend for Photo Studio Management System.

## Features

- **Authentication**: Laravel Sanctum token-based authentication
- **Role-Based Access Control**: Comprehensive role and permission system
- **Service Layer**: Email, PDF, and S3 services
- **Database-Driven Configuration**: Settings stored in database
- **Email System**: Dynamic SMTP configuration with email logging
- **File Storage**: AWS S3 integration with database configuration

## Requirements

- PHP >= 8.0.2
- Composer
- MySQL
- Node.js & NPM (for frontend assets if needed)

## Installation

1. **Install dependencies:**
   ```bash
   composer install
   ```

2. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

4. **Configure database in `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=photo_studio
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

5. **Run migrations:**
   ```bash
   php artisan migrate
   ```

6. **Seed database:**
   ```bash
   php artisan db:seed
   ```

7. **Start development server:**
   ```bash
   php artisan serve
   ```

## Default Admin Credentials

- **Email:** admin@example.com
- **Password:** password

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (protected)
- `GET /api/auth/user` - Get current user (protected)
- `POST /api/auth/forgot-password` - Password reset request

### Users
- `GET /api/users` - List users (protected)
- `POST /api/users` - Create user (protected)
- `GET /api/users/{id}` - Get user (protected)
- `PUT /api/users/{id}` - Update user (protected)
- `DELETE /api/users/{id}` - Delete user (protected)

### Roles
- `GET /api/roles` - List roles (protected)
- `POST /api/roles` - Create role (protected)
- `GET /api/roles/{id}` - Get role (protected)
- `PUT /api/roles/{id}` - Update role (protected)
- `PUT /api/roles/{id}/permissions` - Update role permissions (protected)
- `DELETE /api/roles/{id}` - Delete role (protected)

### Permissions
- `GET /api/permissions` - List permissions (protected)
- `GET /api/permissions/{id}` - Get permission (protected)

### Settings
- `GET /api/settings` - Get settings (protected)
- `POST /api/settings/{group}` - Update settings by group (protected)
- `POST /api/settings/test-s3` - Test S3 connection (protected)
- `POST /api/settings/test-email` - Test email configuration (protected)

## Permission System

The system uses a role-based permission system where:
- Admin role has **all permissions** automatically
- Permissions are organized by `module` and `submodule`
- Permissions can be checked using middleware: `permission:view_user`
- Roles can be checked using middleware: `role:admin`

## Services

### EmailService
- Dynamic SMTP configuration from database
- Email logging
- Template rendering
- Attachment support

### PdfExportService
- PDF generation using DomPDF
- Download and stream responses
- Raw binary output for attachments

### S3Service
- Database-driven S3 configuration
- File upload/download
- Connection testing

## Configuration

Settings are stored in the `settings` table and organized by groups:
- `email` - Email configuration
- `s3` - AWS S3 configuration
- `general` - General application settings

## Testing

```bash
php artisan test
```

Ensure you have a MySQL database named `photo_studio_test` configured with credentials matching the values in `phpunit.xml` or override the `DB_*` variables before running the suite.

## License

MIT

