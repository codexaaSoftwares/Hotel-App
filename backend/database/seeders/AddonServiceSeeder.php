<?php

namespace Database\Seeders;

use App\Models\AddonService;
use Illuminate\Database\Seeder;

class AddonServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $services = [
            ['name' => 'Extra Bed (pc)', 'charge' => 500, 'status' => 'active'],
            ['name' => 'Laundry (pc)', 'charge' => 50, 'status' => 'active'],
        ];

        foreach ($services as $service) {
            AddonService::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }
}
