# Teja Hotel - Hotel Management Web Application

A comprehensive web application for managing hotel restaurant operations, room bookings, billing, and financial management.

## 🚀 Quick Start

### Frontend (Admin Panel)

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the admin panel.

### Backend (API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

API will be available at [http://localhost:8000/api](http://localhost:8000/api)

## 📦 Tech Stack

**Frontend:**
- React 19
- Vite
- React Bootstrap
- CoreUI React

**Backend:**
- Laravel 9
- MySQL
- Laravel Sanctum (Authentication)

## 📁 Project Structure

```
Hotel-App/
├── admin/          # React frontend (admin panel)
├── backend/        # Laravel API backend
└── structure & development guideline/  # Documentation
```

## 🔧 Environment Setup

1. Copy `admin/env.example` to `admin/.env.local`
2. Copy `backend/env.example` to `backend/.env`
3. Update database credentials and API URLs
4. Run migrations and seeders

## 📝 Development

- Frontend: `cd admin && npm run dev`
- Backend: `cd backend && php artisan serve`

---

**Status**: In Development  
**Version**: 1.0.0
