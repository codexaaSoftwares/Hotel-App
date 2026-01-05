# Hotel Management - Admin Panel

React admin dashboard for Hotel Management Web Application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp env.example .env.local
# Update .env.local with your configuration
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the admin panel.

## 🔧 Build Commands

### Development Build
```bash
npm run build:dev
```

### Staging Build
```bash
npm run build:staging
```

### Production Build
```bash
npm run build:prod
```

### Preview Builds
```bash
npm run preview:dev      # Preview dev build
npm run preview:staging  # Preview staging build
npm run preview:prod     # Preview production build
```

## 📦 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Bootstrap** - Component library
- **CoreUI React** - Admin dashboard template
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **FontAwesome** - Icon library

## 📁 Project Structure

```
admin/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── views/          # Main view components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── constants/      # Application constants
│   ├── context/        # React Context providers
│   ├── config/         # Configuration files
│   └── assets/         # Static assets
├── env.example         # Environment variables template
├── package.json        # Dependencies & scripts
└── vite.config.js      # Vite configuration
```

## 🔐 Environment Configuration

Copy `env.example` to `.env.local` and update:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

Variables are available via `import.meta.env`:
```js
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

## 📝 Development

- **Dev Server**: `npm run dev`
- **Linting**: `npm run lint`
- **Build**: `npm run build:prod`

---

**Status**: In Development  
**Version**: 1.0.0
