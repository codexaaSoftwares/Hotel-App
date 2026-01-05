<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
            [
                'name' => 'admin',
                'description' => 'Administrator with full access',
                'is_active' => true,
            ],
            [
                'name' => 'branch-manager',
                'description' => 'Branch Manager role',
                'is_active' => true,
            ],
            [
                'name' => 'manager',
                'description' => 'Manager role',
                'is_active' => true,
            ],
            [
                'name' => 'staff',
                'description' => 'Staff member',
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}

