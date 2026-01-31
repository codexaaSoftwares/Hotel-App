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
            // User Management
            ['name' => 'view_user', 'description' => 'View users', 'module' => 'users', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_user', 'description' => 'Create users', 'module' => 'users', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_user', 'description' => 'Edit users', 'module' => 'users', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_user', 'description' => 'Delete users', 'module' => 'users', 'submodule' => 'management', 'type' => 'delete'],

            // Role Management
            ['name' => 'view_role', 'description' => 'View roles', 'module' => 'roles', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_role', 'description' => 'Create roles', 'module' => 'roles', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_role', 'description' => 'Edit roles', 'module' => 'roles', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_role', 'description' => 'Delete roles', 'module' => 'roles', 'submodule' => 'management', 'type' => 'delete'],

            // Permission Management
            ['name' => 'view_permission', 'description' => 'View permissions', 'module' => 'permissions', 'submodule' => 'management', 'type' => 'read'],

            // Settings Management
            ['name' => 'view_setting', 'description' => 'View settings', 'module' => 'settings', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'edit_setting', 'description' => 'Edit settings', 'module' => 'settings', 'submodule' => 'management', 'type' => 'write'],

            // Branch Management
            ['name' => 'view_branch', 'description' => 'View branches', 'module' => 'branches', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_branch', 'description' => 'Create branches', 'module' => 'branches', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_branch', 'description' => 'Edit branches', 'module' => 'branches', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_branch', 'description' => 'Delete branches', 'module' => 'branches', 'submodule' => 'management', 'type' => 'delete'],

            // Dashboard
            ['name' => 'view_dashboard', 'description' => 'View dashboard analytics', 'module' => 'dashboard', 'submodule' => 'overview', 'type' => 'read'],

            // Report Management
            ['name' => 'view_report', 'description' => 'View reports', 'module' => 'reports', 'submodule' => 'management', 'type' => 'read'],

            // Restaurant Settings Management
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

            // Customer Management
            ['name' => 'view_customer', 'description' => 'View customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_customer', 'description' => 'Create customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_customer', 'description' => 'Edit customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_customer', 'description' => 'Delete customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'delete'],

            // Customer Ledger
            ['name' => 'view_customer_ledger', 'description' => 'View customer ledger', 'module' => 'customers', 'submodule' => 'ledger', 'type' => 'read'],

            // Wallet Transaction Management
            ['name' => 'view_wallet_transaction', 'description' => 'View wallet transactions', 'module' => 'wallet', 'submodule' => 'transactions', 'type' => 'read'],
            ['name' => 'create_wallet_transaction', 'description' => 'Create wallet transactions', 'module' => 'wallet', 'submodule' => 'transactions', 'type' => 'write'],
            ['name' => 'edit_wallet_transaction', 'description' => 'Edit wallet transactions', 'module' => 'wallet', 'submodule' => 'transactions', 'type' => 'write'],
            ['name' => 'delete_wallet_transaction', 'description' => 'Delete wallet transactions', 'module' => 'wallet', 'submodule' => 'transactions', 'type' => 'delete'],

            // Bill Management (POS Panel)
            ['name' => 'view_bill', 'description' => 'View bills', 'module' => 'bills', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_bill', 'description' => 'Create bills', 'module' => 'bills', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_bill', 'description' => 'Edit bills', 'module' => 'bills', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_bill', 'description' => 'Delete bills', 'module' => 'bills', 'submodule' => 'management', 'type' => 'delete'],
            ['name' => 'bill_payment', 'description' => 'Process bill payments', 'module' => 'bills', 'submodule' => 'payments', 'type' => 'write'],
            ['name' => 'view_pending_bill', 'description' => 'View pending bills', 'module' => 'bills', 'submodule' => 'pending', 'type' => 'read'],
            ['name' => 'create_pending_bill', 'description' => 'Create pending bills', 'module' => 'bills', 'submodule' => 'pending', 'type' => 'write'],

            // Staff Management
            ['name' => 'view_staff', 'description' => 'View staff', 'module' => 'staff', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_staff', 'description' => 'Create staff', 'module' => 'staff', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_staff', 'description' => 'Edit staff', 'module' => 'staff', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_staff', 'description' => 'Delete staff', 'module' => 'staff', 'submodule' => 'management', 'type' => 'delete'],

            // Salary Payment Management
            ['name' => 'view_salary_payment', 'description' => 'View salary payments', 'module' => 'staff', 'submodule' => 'salary_payments', 'type' => 'read'],
            ['name' => 'create_salary_payment', 'description' => 'Create salary payments', 'module' => 'staff', 'submodule' => 'salary_payments', 'type' => 'write'],
            ['name' => 'edit_salary_payment', 'description' => 'Edit salary payments', 'module' => 'staff', 'submodule' => 'salary_payments', 'type' => 'write'],
            ['name' => 'delete_salary_payment', 'description' => 'Delete salary payments', 'module' => 'staff', 'submodule' => 'salary_payments', 'type' => 'delete'],

            // Expense Category Management
            ['name' => 'view_expense_category', 'description' => 'View expense categories', 'module' => 'expenses', 'submodule' => 'categories', 'type' => 'read'],
            ['name' => 'create_expense_category', 'description' => 'Create expense categories', 'module' => 'expenses', 'submodule' => 'categories', 'type' => 'write'],
            ['name' => 'edit_expense_category', 'description' => 'Edit expense categories', 'module' => 'expenses', 'submodule' => 'categories', 'type' => 'write'],
            ['name' => 'delete_expense_category', 'description' => 'Delete expense categories', 'module' => 'expenses', 'submodule' => 'categories', 'type' => 'delete'],

            // Expense Management
            ['name' => 'view_expense', 'description' => 'View expenses', 'module' => 'expenses', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_expense', 'description' => 'Create expenses', 'module' => 'expenses', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_expense', 'description' => 'Edit expenses', 'module' => 'expenses', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_expense', 'description' => 'Delete expenses', 'module' => 'expenses', 'submodule' => 'management', 'type' => 'delete'],

            // Special Permissions
            ['name' => 'special_export_data', 'description' => 'Export data to Excel/PDF', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_import_data', 'description' => 'Import data from Excel/CSV', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_bulk_delete', 'description' => 'Bulk delete operations', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_bulk_update', 'description' => 'Bulk update operations', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_view_audit_logs', 'description' => 'View audit logs and activity history', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_manage_backups', 'description' => 'Manage database backups', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_system_maintenance', 'description' => 'Access system maintenance mode', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_view_all_branches', 'description' => 'View all branches regardless of assignment', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
            ['name' => 'special_override_restrictions', 'description' => 'Override business rules and restrictions', 'module' => 'special', 'submodule' => 'special', 'type' => 'special'],
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

