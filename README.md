# NZ Grocery Store - React Frontend

A modern React application built with Vite and React Bootstrap for the NZ Grocery Store.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

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
- **React Router DOM** - Client-side routing
- **React Icons** - Icon library
- **FontAwesome** - Icon library
- **Local Storage** - Data persistence
- **Context API** - State management

## 📁 Project Structure

```
client/
├── public/                      # Static assets
│   ├── approval-requirnment/    # Project requirement images
│   └── index.html
├── src/                         # Source code
│   ├── components/              # Reusable components
│   │   ├── common/              # Common/shared components
│   │   ├── layout/              # Layout components
│   │   ├── ui/                  # UI components
│   │   └── index.js
│   ├── pages/                   # Page components
│   ├── data/                    # Mock data files
│   ├── assets/                  # Static assets
│   │   ├── images/              # Image assets
│   │   │   ├── ads-banner/      # Ads banner images
│   │   │   ├── main-slider/     # Hero slider images
│   │   │   ├── logo/            # Logo images
│   │   │   └── placeholder.svg
│   │   └── react.svg
│   ├── styles/                  # Global styles
│   │   ├── components/          # Component-specific styles
│   │   │   ├── buttons/         # Button component styles
│   │   │   ├── forms/           # Form component styles
│   │   │   ├── cards/           # Card component styles
│   │   │   ├── modals/          # Modal component styles
│   │   │   ├── tables/          # Table component styles
│   │   │   ├── navigation/      # Navigation component styles
│   │   │   ├── layout-elements/ # Layout component styles
│   │   │   ├── ui-elements/     # UI element styles
│   │   │   ├── ui-components/   # UI component styles
│   │   │   └── index.css
│   │   ├── layouts/             # Layout-specific styles
│   │   ├── utilities/           # Utility classes
│   │   ├── theme.css            # CSS variables & theme
│   │   ├── custom.css           # Bootstrap overrides
│   │   └── global-forms.css     # Global form controls styling
│   ├── utils/                   # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API services
│   │   └── api/                 # API service modules
│   ├── context/                 # React Context providers
│   ├── __tests__/               # Test files
│   ├── __mocks__/               # Mock files
│   ├── test-utils/              # Test utilities
│   ├── config/                  # Configuration files
│   ├── App.jsx                  # Main App component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global CSS
├── .env.local                   # Environment variables (local)
├── .env.staging                 # Environment variables (staging)
├── .env.production              # Environment variables (production)
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Dependency lock file
├── vite.config.js               # Vite configuration
├── vitest.config.js             # Vitest configuration
├── eslint.config.js             # ESLint configuration
├── .gitignore                   # Git ignore rules
└── node_modules/                # Dependencies
```
