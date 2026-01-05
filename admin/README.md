# Photo Studio Management App - React Admin Dashboard

A modern React admin dashboard built with Vite, CoreUI, and React Bootstrap for managing Photo Studio operations.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The dev server uses environment variables from `env.local` (see `env.example` for all keys). Hot Module Replacement (HMR) is enabled.

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

Build outputs go to `dist/`.

### Preview Built Artifacts
```bash
npm run preview            # Preview generic build
npm run preview:dev        # Preview dev build
npm run preview:staging    # Preview staging build
npm run preview:prod       # Preview production build
```

## 📦 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **CoreUI React** - Admin dashboard template & components
- **React Bootstrap** - Component library
- **React Router DOM** - Client-side routing
- **Redux** - State management
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **FontAwesome** - Icon library
- **SCSS** - Styling preprocessor

## 📁 Project Structure

```
admin/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── vite.svg
├── src/                         # Source code
│   ├── components/              # Reusable components
│   │   ├── common/              # Common/shared components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── FormFields.jsx
│   │   │   ├── FormModal.jsx
│   │   │   ├── GlobalSpinner.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── ToastProvider.jsx
│   │   ├── docs/                # Documentation components
│   │   │   ├── DocsComponents.jsx
│   │   │   ├── DocsExample.jsx
│   │   │   ├── DocsIcons.jsx
│   │   │   └── DocsLink.jsx
│   │   ├── layout/              # Layout components
│   │   │   ├── AppBreadcrumb.jsx
│   │   │   ├── AppContent.jsx
│   │   │   ├── AppFooter.jsx
│   │   │   ├── AppHeader.jsx
│   │   │   ├── AppSidebar.jsx
│   │   │   ├── AppSidebarNav.jsx
│   │   │   ├── PermissionRoute.jsx
│   │   │   └── header/          # Header sub-components
│   │   │       ├── AppHeaderDropdown.jsx
│   │   │       └── index.jsx
│   │   ├── pages/               # Page-specific components
│   │   │   ├── categories/
│   │   │   │   └── CategoryForm.jsx
│   │   │   ├── content/
│   │   │   │   ├── BannerFormModal.jsx
│   │   │   │   ├── FAQFormModal.jsx
│   │   │   │   └── NotificationFormModal.jsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerDetailsModal.jsx
│   │   │   │   └── README.md
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryHistoryModal.jsx
│   │   │   │   ├── StockAdjustmentForm.jsx
│   │   │   │   └── README.md
│   │   │   ├── orders/
│   │   │   │   ├── OrderDetailsModal.jsx
│   │   │   │   └── README.md
│   │   │   ├── products/
│   │   │   │   ├── AddProductWizard.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   ├── README.md
│   │   │   │   └── steps/       # Product wizard steps
│   │   │   │       ├── AttributesStep.jsx
│   │   │   │       ├── BasicInfoStep.jsx
│   │   │   │       ├── ImageStep.jsx
│   │   │   │       ├── ReviewStep.jsx
│   │   │   │       └── VariantsStep.jsx
│   │   │   ├── roles/
│   │   │   │   └── RoleForm.jsx
│   │   │   ├── subcategories/
│   │   │   │   └── SubCategoryForm.jsx
│   │   │   └── users/
│   │   │       ├── AddressSection.jsx
│   │   │       ├── PersonalInfoSection.jsx
│   │   │       ├── ProfileForm.jsx
│   │   │       ├── ProfilePictureSection.jsx
│   │   │       ├── UserForm.jsx
│   │   │       └── __tests__/   # User component tests
│   │   │           └── ProfileForm.test.js
│   │   ├── README.md
│   │   └── index.jsx
│   ├── pages/                   # Page components
│   │   └── Auth/                # Authentication pages
│   │       ├── ForgotPassword.jsx
│   │       ├── Login.jsx
│   │       └── ResetPassword.jsx
│   ├── views/                   # View components (main pages)
│   │   ├── categories/
│   │   │   └── CategoriesList.jsx
│   │   ├── content/
│   │   │   ├── BannersPromotions.jsx
│   │   │   ├── ContentManagement.jsx
│   │   │   ├── FAQManagement.jsx
│   │   │   └── Notifications.jsx
│   │   ├── customers/
│   │   │   └── CustomersList.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── MainChart.jsx
│   │   ├── inventory/
│   │   │   └── InventoryManagement.jsx
│   │   ├── orders/
│   │   │   └── OrdersList.jsx
│   │   ├── products/
│   │   │   ├── ProductDetails.jsx
│   │   │   └── ProductsList.jsx
│   │   ├── roles/
│   │   │   └── RolesList.jsx
│   │   ├── settings/
│   │   │   └── Settings.jsx
│   │   ├── subcategories/
│   │   │   └── SubCategoriesList.jsx
│   │   └── users/
│   │       ├── Profile.jsx
│   │       └── UsersList.jsx
│   ├── assets/                  # Static assets
│   │   ├── brand/               # Brand assets
│   │   │   ├── logo.jsx
│   │   │   └── sygnet.jsx
│   │   ├── images/              # Image assets
│   │   │   ├── avatars/         # User avatars (9 files)
│   │   │   ├── angular.jpg
│   │   │   ├── components.webp
│   │   │   ├── icons.webp
│   │   │   ├── react.jpg
│   │   │   └── vue.jpg
│   │   ├── login-background.png
│   │   ├── logo/
│   │   │   └── logo-transprant.png
│   │   └── react.svg
│   ├── mock/                    # Mock data files
│   │   ├── categories.json
│   │   ├── content.json
│   │   ├── customers.json
│   │   ├── inventory.json
│   │   ├── orders.json
│   │   ├── products.json
│   │   ├── profile.json
│   │   ├── roles.json
│   │   ├── settings.json
│   │   ├── subCategories.json
│   │   └── users.json
│   ├── services/                # API services
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── contentService.js
│   │   ├── customerService.js
│   │   ├── inventoryService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── profileService.js
│   │   ├── roleService.js
│   │   ├── settingsService.js
│   │   ├── subCategoryService.js
│   │   ├── userService.js
│   │   └── README.md
│   ├── utils/                   # Utility functions
│   │   ├── errorHandler.js
│   │   └── responseHandler.js
│   ├── constants/               # Application constants
│   │   ├── api.js
│   │   ├── permissions.js
│   │   └── README.md
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── README.md
│   ├── hooks/                   # Custom React hooks
│   │   ├── index.jsx
│   │   └── README.md
│   ├── layout/                  # Layout components
│   │   ├── DefaultLayout.jsx
│   │   └── PrivateRoute.jsx
│   ├── config/                  # Configuration files
│   │   └── apiClient.js
│   ├── scss/                    # SCSS styles
│   │   ├── examples.scss
│   │   ├── style.scss
│   │   └── vendors/
│   │       └── simplebar.scss
│   ├── styles/                  # Additional styles
│   │   └── auth.css
│   ├── _nav.jsx                 # Navigation configuration
│   ├── api.js                   # API configuration
│   ├── config.js                # App configuration
│   ├── store.jsx                # Redux store
│   ├── routes.jsx               # Route definitions
│   ├── routesConfig.jsx         # Routes configuration
│   ├── utils.js                 # General utilities
│   ├── App.jsx                  # Main App component
│   ├── App.css                  # App component styles
│   └── main.jsx                 # Entry point
├── styles/                      # Additional global styles
│   └── theme.css
├── backup/                      # Backup files
├── dist/                        # Build output directory
├── env.example                  # Environment variables template
├── env.local                    # Environment variables (local)
├── env.staging                  # Environment variables (staging)
├── env.production               # Environment variables (production)
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Dependency lock file
├── vite.config.js               # Vite configuration
├── eslint.config.js             # ESLint configuration
├── .gitignore                   # Git ignore rules
├── API-Info.md                  # API documentation
└── node_modules/                # Dependencies
```

## 🔐 Environment Files

- `env.example`: Template with all variables
- `env.local`: Used by `npm run dev`
- `env.staging`: Used by `build:staging`/`preview:staging`
- `env.production`: Used by `build:prod`/`preview:prod`

Variables are available via `import.meta.env`, e.g.:

```js
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

For full details, see `ENVIRONMENT_SETUP.md` and `ENVIRONMENT_SETUP_COMPLETE.md`.
