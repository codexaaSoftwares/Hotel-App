# Components Structure

This directory contains all reusable components organized by their purpose and usage.

## 📁 Folder Structure

```
src/components/
├── common/           # Generic reusable components used across the app
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Table.jsx
│   ├── FormModal.jsx
│   ├── FormFields.jsx
│   └── ToastProvider.jsx
├── pages/            # Page-specific components
│   ├── users/
│   │   └── UserForm.jsx
│   ├── roles/
│   └── dashboard/
├── layout/           # Layout and navigation components
│   ├── AppHeader.jsx
│   ├── AppSidebar.jsx
│   ├── AppSidebarNav.jsx
│   ├── AppFooter.jsx
│   ├── AppContent.jsx
│   ├── AppBreadcrumb.jsx
│   ├── PermissionRoute.jsx
│   └── header/
│       └── AppHeaderDropdown.jsx
├── docs/             # Documentation components
│   ├── DocsComponents.jsx
│   ├── DocsExample.jsx
│   ├── DocsIcons.jsx
│   └── DocsLink.jsx
└── index.jsx         # Main export file
```

## 🎯 Component Categories

### **Common Components**
- **Button**: Custom button component with variants
- **Card**: Reusable card component
- **Modal**: Basic modal component
- **Table**: Advanced table with pagination and sorting
- **FormModal**: Modal wrapper for forms
- **FormFields**: Reusable form input components
- **ToastProvider**: Toast notification provider

### **Page-specific Components**
- **UserForm**: User creation/editing form (users page)
- **RoleForm**: Role creation/editing form (roles page)
- **StatsCard**: Dashboard statistics card (dashboard page)
- **ChartCard**: Dashboard chart card (dashboard page)

### **Layout Components**
- **AppHeader**: Main application header
- **AppSidebar**: Navigation sidebar
- **AppSidebarNav**: Sidebar navigation items
- **AppFooter**: Application footer
- **AppContent**: Main content wrapper
- **AppBreadcrumb**: Breadcrumb navigation
- **PermissionRoute**: Route protection component
- **AppHeaderDropdown**: Header dropdown menu

### **Documentation Components**
- **DocsComponents**: Component documentation
- **DocsExample**: Example code display
- **DocsIcons**: Icon documentation
- **DocsLink**: Documentation links

## 📦 Usage

All components are exported from the main `index.jsx` file:

```jsx
// Common components
import { Button, Card, Table, FormModal } from '../../components'

// Page-specific components
import { UserForm } from '../../components'
```

## 🔧 Adding New Components

1. **Common Components**: Add to `common/` folder (generic, reusable)
2. **Page-specific Components**: Add to `pages/[page-name]/` folder
3. **Layout Components**: Add to `layout/` folder
4. **Documentation Components**: Add to `docs/` folder
5. **Update exports**: Add to `index.jsx`

## 📝 Naming Convention

- Use PascalCase for component names
- Use descriptive names that indicate purpose
- Group related components in subfolders when needed
