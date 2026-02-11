<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = [
            // ============================================
            // COMMON PERMISSIONS (Available to all modules)
            // ============================================
            
            // User Management
            ['name' => 'view_user', 'description' => 'View users', 'module' => 'common', 'submodule' => 'users', 'type' => 'read'],
            ['name' => 'create_user', 'description' => 'Create users', 'module' => 'common', 'submodule' => 'users', 'type' => 'write'],
            ['name' => 'edit_user', 'description' => 'Edit users', 'module' => 'common', 'submodule' => 'users', 'type' => 'write'],
            ['name' => 'delete_user', 'description' => 'Delete users', 'module' => 'common', 'submodule' => 'users', 'type' => 'delete'],

            // Role Management
            ['name' => 'view_role', 'description' => 'View roles', 'module' => 'common', 'submodule' => 'roles', 'type' => 'read'],
            ['name' => 'create_role', 'description' => 'Create roles', 'module' => 'common', 'submodule' => 'roles', 'type' => 'write'],
            ['name' => 'edit_role', 'description' => 'Edit roles', 'module' => 'common', 'submodule' => 'roles', 'type' => 'write'],
            ['name' => 'delete_role', 'description' => 'Delete roles', 'module' => 'common', 'submodule' => 'roles', 'type' => 'delete'],

            // Permission Management
            ['name' => 'view_permission', 'description' => 'View permissions', 'module' => 'common', 'submodule' => 'permissions', 'type' => 'read'],

            // Settings Management
            ['name' => 'view_setting', 'description' => 'View global settings', 'module' => 'common', 'submodule' => 'settings', 'type' => 'read'],
            ['name' => 'edit_setting', 'description' => 'Edit global settings', 'module' => 'common', 'submodule' => 'settings', 'type' => 'write'],

            // Dashboard
            ['name' => 'view_dashboard', 'description' => 'View dashboard analytics', 'module' => 'common', 'submodule' => 'dashboard', 'type' => 'read'],
            ['name' => 'dashboard:read', 'description' => 'View dashboard', 'module' => 'common', 'submodule' => 'dashboard', 'type' => 'read'],

            // Customer Management
            ['name' => 'view_customer', 'description' => 'View customers', 'module' => 'common', 'submodule' => 'customers', 'type' => 'read'],
            ['name' => 'create_customer', 'description' => 'Create customers', 'module' => 'common', 'submodule' => 'customers', 'type' => 'write'],
            ['name' => 'edit_customer', 'description' => 'Edit customers', 'module' => 'common', 'submodule' => 'customers', 'type' => 'write'],
            ['name' => 'delete_customer', 'description' => 'Delete customers', 'module' => 'common', 'submodule' => 'customers', 'type' => 'delete'],
            ['name' => 'view_customer_ledger', 'description' => 'View customer ledger', 'module' => 'common', 'submodule' => 'customers', 'type' => 'read'],

            // Wallet Transaction Management
            ['name' => 'view_wallet_transaction', 'description' => 'View wallet transactions', 'module' => 'common', 'submodule' => 'wallet', 'type' => 'read'],
            ['name' => 'create_wallet_transaction', 'description' => 'Create wallet transactions', 'module' => 'common', 'submodule' => 'wallet', 'type' => 'write'],
            ['name' => 'edit_wallet_transaction', 'description' => 'Edit wallet transactions', 'module' => 'common', 'submodule' => 'wallet', 'type' => 'write'],
            ['name' => 'delete_wallet_transaction', 'description' => 'Delete wallet transactions', 'module' => 'common', 'submodule' => 'wallet', 'type' => 'delete'],

            // Staff Management
            ['name' => 'view_staff', 'description' => 'View staff', 'module' => 'common', 'submodule' => 'staff', 'type' => 'read'],
            ['name' => 'create_staff', 'description' => 'Create staff', 'module' => 'common', 'submodule' => 'staff', 'type' => 'write'],
            ['name' => 'edit_staff', 'description' => 'Edit staff', 'module' => 'common', 'submodule' => 'staff', 'type' => 'write'],
            ['name' => 'delete_staff', 'description' => 'Delete staff', 'module' => 'common', 'submodule' => 'staff', 'type' => 'delete'],

            // Salary Payment Management
            ['name' => 'view_salary_payment', 'description' => 'View salary payments', 'module' => 'common', 'submodule' => 'staff', 'type' => 'read'],
            ['name' => 'create_salary_payment', 'description' => 'Create salary payments', 'module' => 'common', 'submodule' => 'staff', 'type' => 'write'],
            ['name' => 'edit_salary_payment', 'description' => 'Edit salary payments', 'module' => 'common', 'submodule' => 'staff', 'type' => 'write'],
            ['name' => 'delete_salary_payment', 'description' => 'Delete salary payments', 'module' => 'common', 'submodule' => 'staff', 'type' => 'delete'],

            // Expense Category Management
            ['name' => 'view_expense_category', 'description' => 'View expense categories', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'read'],
            ['name' => 'create_expense_category', 'description' => 'Create expense categories', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'write'],
            ['name' => 'edit_expense_category', 'description' => 'Edit expense categories', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'write'],
            ['name' => 'delete_expense_category', 'description' => 'Delete expense categories', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'delete'],

            // Expense Management
            ['name' => 'view_expense', 'description' => 'View expenses', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'read'],
            ['name' => 'create_expense', 'description' => 'Create expenses', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'write'],
            ['name' => 'edit_expense', 'description' => 'Edit expenses', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'write'],
            ['name' => 'delete_expense', 'description' => 'Delete expenses', 'module' => 'common', 'submodule' => 'expenses', 'type' => 'delete'],

            // Special Permissions
            ['name' => 'special_export_data', 'description' => 'Export data to Excel/PDF', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_import_data', 'description' => 'Import data from Excel/CSV', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_bulk_delete', 'description' => 'Bulk delete operations', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_bulk_update', 'description' => 'Bulk update operations', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_view_audit_logs', 'description' => 'View audit logs and activity history', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_manage_backups', 'description' => 'Manage database backups', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_system_maintenance', 'description' => 'Access system maintenance mode', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_override_restrictions', 'description' => 'Override business rules and restrictions', 'module' => 'common', 'submodule' => 'special', 'type' => 'special'],

            // ============================================
            // RESTAURANT MODULE PERMISSIONS
            // ============================================
            
            // Restaurant Dashboard
            ['name' => 'restaurant_dashboard:read', 'description' => 'View restaurant dashboard', 'module' => 'restaurant', 'submodule' => 'dashboard', 'type' => 'read'],

            // Restaurant Settings
            ['name' => 'view_restaurant_settings', 'description' => 'View restaurant settings', 'module' => 'restaurant', 'submodule' => 'settings', 'type' => 'read'],
            ['name' => 'edit_restaurant_settings', 'description' => 'Edit restaurant settings', 'module' => 'restaurant', 'submodule' => 'settings', 'type' => 'write'],

            // Food Category Management
            ['name' => 'view_food_category', 'description' => 'View food categories', 'module' => 'restaurant', 'submodule' => 'food_categories', 'type' => 'read'],
            ['name' => 'create_food_category', 'description' => 'Create food categories', 'module' => 'restaurant', 'submodule' => 'food_categories', 'type' => 'write'],
            ['name' => 'edit_food_category', 'description' => 'Edit food categories', 'module' => 'restaurant', 'submodule' => 'food_categories', 'type' => 'write'],
            ['name' => 'delete_food_category', 'description' => 'Delete food categories', 'module' => 'restaurant', 'submodule' => 'food_categories', 'type' => 'delete'],

            // Food Item Management
            ['name' => 'view_food_item', 'description' => 'View food items', 'module' => 'restaurant', 'submodule' => 'food_items', 'type' => 'read'],
            ['name' => 'create_food_item', 'description' => 'Create food items', 'module' => 'restaurant', 'submodule' => 'food_items', 'type' => 'write'],
            ['name' => 'edit_food_item', 'description' => 'Edit food items', 'module' => 'restaurant', 'submodule' => 'food_items', 'type' => 'write'],
            ['name' => 'delete_food_item', 'description' => 'Delete food items', 'module' => 'restaurant', 'submodule' => 'food_items', 'type' => 'delete'],

            // Table Management
            ['name' => 'view_table', 'description' => 'View tables', 'module' => 'restaurant', 'submodule' => 'tables', 'type' => 'read'],
            ['name' => 'create_table', 'description' => 'Create tables', 'module' => 'restaurant', 'submodule' => 'tables', 'type' => 'write'],
            ['name' => 'edit_table', 'description' => 'Edit tables', 'module' => 'restaurant', 'submodule' => 'tables', 'type' => 'write'],
            ['name' => 'delete_table', 'description' => 'Delete tables', 'module' => 'restaurant', 'submodule' => 'tables', 'type' => 'delete'],

            // Bill Management (POS Panel)
            ['name' => 'view_bill', 'description' => 'View bills', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'read'],
            ['name' => 'create_bill', 'description' => 'Create bills', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'write'],
            ['name' => 'edit_bill', 'description' => 'Edit bills', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'write'],
            ['name' => 'delete_bill', 'description' => 'Delete bills', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'delete'],
            ['name' => 'bill_payment', 'description' => 'Process bill payments', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'write'],
            ['name' => 'view_pending_bill', 'description' => 'View pending bills', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'read'],
            ['name' => 'create_pending_bill', 'description' => 'Create pending bills', 'module' => 'restaurant', 'submodule' => 'bills', 'type' => 'write'],

            // Restaurant Reports
            ['name' => 'view_report', 'description' => 'View reports', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'sales_report:read', 'description' => 'View sales report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'expense_report:read', 'description' => 'View expense report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'gst_report:read', 'description' => 'View GST summary report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'customer_pending_report:read', 'description' => 'View customer pending report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'customer_ledger_report:read', 'description' => 'View customer ledger report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'staff_salary_report:read', 'description' => 'View staff & salary report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'business_dashboard:read', 'description' => 'View business dashboard report', 'module' => 'restaurant', 'submodule' => 'reports', 'type' => 'read'],

            // ============================================
            // HOTEL ROOM MODULE PERMISSIONS (Planned)
            // ============================================
            
            // Hotel Room Dashboard
            ['name' => 'hotel_room_dashboard:read', 'description' => 'View hotel room dashboard', 'module' => 'hotel_room', 'submodule' => 'dashboard', 'type' => 'read'],

            // Room Management
            ['name' => 'room:read', 'description' => 'View rooms', 'module' => 'hotel_room', 'submodule' => 'rooms', 'type' => 'read'],
            ['name' => 'room:write', 'description' => 'Create/Edit rooms', 'module' => 'hotel_room', 'submodule' => 'rooms', 'type' => 'write'],
            ['name' => 'room:delete', 'description' => 'Delete rooms', 'module' => 'hotel_room', 'submodule' => 'rooms', 'type' => 'delete'],

            // Room Category Management
            ['name' => 'room_type:read', 'description' => 'View room categories', 'module' => 'hotel_room', 'submodule' => 'room_categories', 'type' => 'read'],
            ['name' => 'room_type:write', 'description' => 'Create/Edit room categories', 'module' => 'hotel_room', 'submodule' => 'room_categories', 'type' => 'write'],
            ['name' => 'room_type:delete', 'description' => 'Delete room categories', 'module' => 'hotel_room', 'submodule' => 'room_categories', 'type' => 'delete'],

            // Booking Management
            ['name' => 'booking:read', 'description' => 'View bookings', 'module' => 'hotel_room', 'submodule' => 'bookings', 'type' => 'read'],
            ['name' => 'booking:write', 'description' => 'Create/Edit bookings', 'module' => 'hotel_room', 'submodule' => 'bookings', 'type' => 'write'],
            ['name' => 'booking:delete', 'description' => 'Delete bookings', 'module' => 'hotel_room', 'submodule' => 'bookings', 'type' => 'delete'],

            // Hotel Settings
            ['name' => 'hotel_settings:read', 'description' => 'View hotel settings', 'module' => 'hotel_room', 'submodule' => 'settings', 'type' => 'read'],
            ['name' => 'hotel_settings:write', 'description' => 'Edit hotel settings', 'module' => 'hotel_room', 'submodule' => 'settings', 'type' => 'write'],

            // Hotel Room Reports
            ['name' => 'occupancy_report:read', 'description' => 'View occupancy report', 'module' => 'hotel_room', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'revenue_report:read', 'description' => 'View revenue report', 'module' => 'hotel_room', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'booking_report:read', 'description' => 'View booking report', 'module' => 'hotel_room', 'submodule' => 'reports', 'type' => 'read'],

            // ============================================
            // BANQUET HALL MODULE PERMISSIONS (Planned)
            // ============================================
            
            // Banquet Hall Dashboard
            ['name' => 'banquet_dashboard:read', 'description' => 'View banquet hall dashboard', 'module' => 'banquet_hall', 'submodule' => 'dashboard', 'type' => 'read'],

            // Hall Management
            ['name' => 'hall:read', 'description' => 'View halls', 'module' => 'banquet_hall', 'submodule' => 'halls', 'type' => 'read'],
            ['name' => 'hall:write', 'description' => 'Create/Edit halls', 'module' => 'banquet_hall', 'submodule' => 'halls', 'type' => 'write'],
            ['name' => 'hall:delete', 'description' => 'Delete halls', 'module' => 'banquet_hall', 'submodule' => 'halls', 'type' => 'delete'],

            // Banquet Booking Management
            ['name' => 'banquet_booking:read', 'description' => 'View banquet bookings', 'module' => 'banquet_hall', 'submodule' => 'bookings', 'type' => 'read'],
            ['name' => 'banquet_booking:write', 'description' => 'Create/Edit banquet bookings', 'module' => 'banquet_hall', 'submodule' => 'bookings', 'type' => 'write'],
            ['name' => 'banquet_booking:delete', 'description' => 'Delete banquet bookings', 'module' => 'banquet_hall', 'submodule' => 'bookings', 'type' => 'delete'],

            // Banquet Settings
            ['name' => 'banquet_settings:read', 'description' => 'View banquet settings', 'module' => 'banquet_hall', 'submodule' => 'settings', 'type' => 'read'],
            ['name' => 'banquet_settings:write', 'description' => 'Edit banquet settings', 'module' => 'banquet_hall', 'submodule' => 'settings', 'type' => 'write'],

            // Banquet Hall Reports
            ['name' => 'banquet_report:read', 'description' => 'View banquet report', 'module' => 'banquet_hall', 'submodule' => 'reports', 'type' => 'read'],
            ['name' => 'banquet_revenue_report:read', 'description' => 'View banquet revenue report', 'module' => 'banquet_hall', 'submodule' => 'reports', 'type' => 'read'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                array_merge($permission, [
                    'is_active' => true,
                ])
            );
        }
    }
}
