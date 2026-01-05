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
        ];

        $staffPermissionNames = [
            'view_dashboard',
            'view_branch',
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

