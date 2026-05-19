<?php

namespace Database\Seeders;

use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            [
                'name' => 'Standard',
                'description' => 'Standard rooms with basic amenities',
                'base_price' => 1500.00,
                'max_adults' => 2,
                'max_children' => 1,
                'status' => 'active',
            ],
            [
                'name' => 'Deluxe',
                'description' => 'Deluxe rooms with enhanced amenities',
                'base_price' => 2500.00,
                'max_adults' => 3,
                'max_children' => 2,
                'status' => 'active',
            ],
            [
                'name' => 'Suite',
                'description' => 'Luxury suites with premium amenities',
                'base_price' => 5000.00,
                'max_adults' => 4,
                'max_children' => 2,
                'status' => 'active',
            ],
            [
                'name' => 'Family',
                'description' => 'Family rooms suitable for larger groups',
                'base_price' => 3500.00,
                'max_adults' => 4,
                'max_children' => 3,
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            RoomCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}

