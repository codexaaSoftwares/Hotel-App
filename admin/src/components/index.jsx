// Layout Components
import AppBreadcrumb from './layout/AppBreadcrumb'
import AppContent from './layout/AppContent'
import AppFooter from './layout/AppFooter'
import AppHeader from './layout/AppHeader'
import AppSidebar from './layout/AppSidebar'
import { AppSidebarNav } from './layout/AppSidebarNav'
import PermissionRoute from './layout/PermissionRoute'
import { AppHeaderDropdown } from './layout/header'

// Common Components
import Button from './common/Button'
import Card from './common/Card'
import Modal from './common/Modal'
import Table from './common/Table'
import FormModal from './common/FormModal'
import GlobalSpinner from './common/GlobalSpinner'
import ImageUpload from './common/ImageUpload'
import StepIndicator from './common/StepIndicator'
import ScrollToTop from './common/ScrollToTop'
import ThemeToggle from './common/ThemeToggle'
import { TextField, SelectField, FormRow } from './common/FormFields'
import ToastProvider, { useToast } from './common/ToastProvider'

// Page-specific Components
import UserForm from './pages/users/UserForm'
import ProfileForm from './pages/users/ProfileForm'
import ProfilePictureSection from './pages/users/ProfilePictureSection'
import PersonalInfoSection from './pages/users/PersonalInfoSection'
import AddressSection from './pages/users/AddressSection'
import RoleForm from './pages/roles/RoleForm'
// Settings components removed - now integrated into main Settings.jsx

// Documentation Components
import DocsComponents from './docs/DocsComponents'
import DocsIcons from './docs/DocsIcons'
import DocsLink from './docs/DocsLink'
import DocsExample from './docs/DocsExample'

export {
  // Layout
  AppBreadcrumb,
  AppContent,
  AppFooter,
  AppHeader,
  AppHeaderDropdown,
  AppSidebar,
  AppSidebarNav,
  PermissionRoute,
  
  // Common
  Button,
  Card,
  Modal,
  Table,
  FormModal,
  GlobalSpinner,
  ImageUpload,
  StepIndicator,
  ScrollToTop,
  ThemeToggle,
  TextField,
  SelectField,
  FormRow,
  UserForm,
  ProfileForm,
  ProfilePictureSection,
  PersonalInfoSection,
  AddressSection,
  RoleForm,
  // Settings components removed - now integrated into main Settings.jsx
  ToastProvider,
  useToast,
  
  // Documentation
  DocsComponents,
  DocsIcons,
  DocsLink,
  DocsExample,
}