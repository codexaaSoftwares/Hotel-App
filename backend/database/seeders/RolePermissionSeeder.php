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
        $roles = Role::whereIn('name', ['branch-manager', 'manager', 'staff'])->get()->keyBy('name');

        if ($roles->isEmpty()) {
            return;
        }

        $branchManagerPermissionNames = [
            'view_dashboard',
            'view_branch',
        ];

        $managerPermissionNames = [
            'view_user',
            'view_role',
            'view_permission',
            'view_setting',
            'edit_setting',
            'view_dashboard',
            'view_branch',
            'create_branch',
            'edit_branch',
            'delete_branch',
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
        ];

        $staffPermissionNames = [
            'view_dashboard',
            'view_branch',
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

        if ($branchManager = $roles->get('branch-manager')) {
            $branchManagerPermissions = Permission::whereIn('name', $branchManagerPermissionNames)->pluck('id');
            $branchManager->permissions()->syncWithoutDetaching($branchManagerPermissions);
        }

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

