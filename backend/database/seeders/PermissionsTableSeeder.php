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

            // Package Management
            ['name' => 'view_package', 'description' => 'View packages', 'module' => 'packages', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_package', 'description' => 'Create packages', 'module' => 'packages', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_package', 'description' => 'Edit packages', 'module' => 'packages', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_package', 'description' => 'Delete packages', 'module' => 'packages', 'submodule' => 'management', 'type' => 'delete'],

            // Customer Management
            ['name' => 'view_customer', 'description' => 'View customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_customer', 'description' => 'Create customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_customer', 'description' => 'Edit customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_customer', 'description' => 'Delete customers', 'module' => 'customers', 'submodule' => 'management', 'type' => 'delete'],

            // Order Management
            ['name' => 'view_order', 'description' => 'View orders', 'module' => 'orders', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_order', 'description' => 'Create orders', 'module' => 'orders', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_order', 'description' => 'Edit orders', 'module' => 'orders', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_order', 'description' => 'Delete orders', 'module' => 'orders', 'submodule' => 'management', 'type' => 'delete'],

            // Payment Management
            ['name' => 'view_payment', 'description' => 'View payments', 'module' => 'payments', 'submodule' => 'management', 'type' => 'read'],
            ['name' => 'create_payment', 'description' => 'Create payments', 'module' => 'payments', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'edit_payment', 'description' => 'Edit payments', 'module' => 'payments', 'submodule' => 'management', 'type' => 'write'],
            ['name' => 'delete_payment', 'description' => 'Delete payments', 'module' => 'payments', 'submodule' => 'management', 'type' => 'delete'],

            // Dashboard
            ['name' => 'view_dashboard', 'description' => 'View dashboard analytics', 'module' => 'dashboard', 'submodule' => 'overview', 'type' => 'read'],

            // Report Management
            ['name' => 'view_report', 'description' => 'View reports', 'module' => 'reports', 'submodule' => 'management', 'type' => 'read'],

            // Financial Transaction Management
            ['name' => 'view_financial_transaction', 'description' => 'View financial transactions', 'module' => 'financial', 'submodule' => 'transactions', 'type' => 'read'],
            ['name' => 'create_financial_transaction', 'description' => 'Create financial transactions', 'module' => 'financial', 'submodule' => 'transactions', 'type' => 'write'],
            ['name' => 'edit_financial_transaction', 'description' => 'Edit financial transactions', 'module' => 'financial', 'submodule' => 'transactions', 'type' => 'write'],
            ['name' => 'delete_financial_transaction', 'description' => 'Delete financial transactions', 'module' => 'financial', 'submodule' => 'transactions', 'type' => 'delete'],

            // Financial Category Management
            ['name' => 'view_financial_category', 'description' => 'View financial categories', 'module' => 'financial', 'submodule' => 'categories', 'type' => 'read'],
            ['name' => 'create_financial_category', 'description' => 'Create financial categories', 'module' => 'financial', 'submodule' => 'categories', 'type' => 'write'],
            ['name' => 'edit_financial_category', 'description' => 'Edit financial categories', 'module' => 'financial', 'submodule' => 'categories', 'type' => 'write'],
            ['name' => 'delete_financial_category', 'description' => 'Delete financial categories', 'module' => 'financial', 'submodule' => 'categories', 'type' => 'delete'],
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

