<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $branches = [
            [
                'branch_code' => 'L001',
                'branch_name' => 'Lunawada Branch',
                'email' => 'lunawada@photostudio.com',
                'contact_number' => '+91 98765 43210',
                'address' => '123 Main Street, Lunawada',
                'city' => 'Lunawada',
                'state' => 'Gujarat',
                'country' => 'India',
                'postal_code' => '389230',
                'status' => 'active',
            ],
            [
                'branch_code' => 'V001',
                'branch_name' => 'Vadodara Branch',
                'email' => 'vadodara@photostudio.com',
                'contact_number' => '+91 98765 43211',
                'address' => '456 Station Road, Vadodara',
                'city' => 'Vadodara',
                'state' => 'Gujarat',
                'country' => 'India',
                'postal_code' => '390005',
                'status' => 'active',
            ],
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(
                ['branch_code' => $branch['branch_code']],
                $branch
            );
        }
    }
}

