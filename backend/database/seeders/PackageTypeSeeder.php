<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PackageType;

class PackageTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $packageTypes = [
            [
                'name' => 'Album',
                'description' => 'Photo album packages',
                'status' => 'active',
            ],
            [
                'name' => 'PhotoShoot',
                'description' => 'Photography session packages',
                'status' => 'active',
            ],
            [
                'name' => 'Editing',
                'description' => 'Photo editing and retouching services',
                'status' => 'active',
            ],
            [
                'name' => 'Video',
                'description' => 'Video production and editing packages',
                'status' => 'active',
            ],
            [
                'name' => 'Ring Ceremony',
                'description' => 'Ring ceremony photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Pre-wedding',
                'description' => 'Pre-wedding photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Wedding',
                'description' => 'Wedding photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Reception',
                'description' => 'Reception photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Birthday',
                'description' => 'Birthday party photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Shrimant',
                'description' => 'Shrimant ceremony photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Maternity Shoot',
                'description' => 'Maternity photography sessions',
                'status' => 'active',
            ],
            [
                'name' => 'Newborn',
                'description' => 'Newborn photography sessions',
                'status' => 'active',
            ],
            [
                'name' => 'Baby Shoot',
                'description' => 'Baby photography sessions',
                'status' => 'active',
            ],
            [
                'name' => 'other',
                'description' => 'Other photography and videography services',
                'status' => 'active',
            ],
            [
                'name' => 'Corporate Event',
                'description' => 'Corporate event photography and videography',
                'status' => 'active',
            ],
            [
                'name' => 'Product Photography',
                'description' => 'Product photography services',
                'status' => 'active',
            ],
            [
                'name' => 'Festival Shoot',
                'description' => 'Festival and cultural event photography',
                'status' => 'active',
            ],
            [
                'name' => 'Cinematic Video Shoot',
                'description' => 'Cinematic video production and shooting',
                'status' => 'active',
            ],
            [
                'name' => 'Drone Photography',
                'description' => 'Aerial photography and videography using drones',
                'status' => 'active',
            ],
        ];

        foreach ($packageTypes as $type) {
            PackageType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
