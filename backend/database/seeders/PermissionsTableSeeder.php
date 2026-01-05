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

