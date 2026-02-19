<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = Role::whereIn('name', ['manager', 'staff'])->get()->keyBy('name');

        if ($roles->isEmpty()) {
            return;
        }

        $managerPermissionNames = [
            'view_user',
            'view_role',
            'view_permission',
            'view_setting',
            'edit_setting',
            'view_dashboard',
            'dashboard:read',
            'restaurant_dashboard:read',
            // Restaurant Management
            'view_restaurant_settings',
            'edit_restaurant_settings',
            'view_food_category',
            'create_food_category',
            'edit_food_category',
            'delete_food_category',
            'view_food_item',
            'create_food_item',
            'edit_food_item',
            'delete_food_item',
            'view_table',
            'create_table',
            'edit_table',
            'delete_table',
            // Customer Management
            'view_customer',
            'create_customer',
            'edit_customer',
            'delete_customer',
            'view_customer_ledger',
            // Bill Management (POS Panel)
            'view_bill',
            'create_bill',
            'edit_bill',
            'delete_bill',
            'bill_payment',
            'view_pending_bill',
            'create_pending_bill',
            // Wallet Transactions
            'view_wallet_transaction',
            'create_wallet_transaction',
            'edit_wallet_transaction',
            'delete_wallet_transaction',
            // Hotel Room - Addon Services
            'view_addon_service',
            'create_addon_service',
            'edit_addon_service',
            'delete_addon_service',
            // Reports
            'view_report',
            'sales_report:read',
            'expense_report:read',
            'gst_report:read',
            'customer_pending_report:read',
            'customer_ledger_report:read',
            'staff_salary_report:read',
            'business_dashboard:read',
        ];

        $staffPermissionNames = [
            'view_dashboard',
            'dashboard:read',
            'restaurant_dashboard:read',
            // Bill Management (POS Panel) - Staff can create and view bills
            'view_bill',
            'create_bill',
            'edit_bill',
            'bill_payment',
            'view_pending_bill',
            'create_pending_bill',
            // Customer Management - Staff can view and create customers
            'view_customer',
            'create_customer',
            'view_customer_ledger',
        ];

        if ($manager = $roles->get('manager')) {
            $managerPermissions = Permission::whereIn('name', $managerPermissionNames)->pluck('id');
            $manager->permissions()->syncWithoutDetaching($managerPermissions);
        }

        if ($staff = $roles->get('staff')) {
            $staffPermissions = Permission::whereIn('name', $staffPermissionNames)->pluck('id');
            $staff->permissions()->syncWithoutDetaching($staffPermissions);
        }
    }
}

