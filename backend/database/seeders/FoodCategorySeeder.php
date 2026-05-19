<?php

namespace Database\Seeders;

use App\Models\FoodCategory;
use Illuminate\Database\Seeder;

class FoodCategorySeeder extends Seeder
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
                'name' => 'Punjabi Sabji',
                'description' => 'Traditional Punjabi vegetable dishes',
                'display_order' => 1,
                'status' => 'active',
            ],
            [
                'name' => 'Chinese Sabji',
                'description' => 'Chinese style vegetable dishes',
                'display_order' => 2,
                'status' => 'active',
            ],
            [
                'name' => 'Chinese Rice',
                'description' => 'Chinese style rice dishes',
                'display_order' => 3,
                'status' => 'active',
            ],
            [
                'name' => 'Chinese Noodles',
                'description' => 'Chinese style noodle dishes',
                'display_order' => 4,
                'status' => 'active',
            ],
            [
                'name' => 'Rice / Biryani',
                'description' => 'Rice and biryani dishes',
                'display_order' => 5,
                'status' => 'active',
            ],
            [
                'name' => 'Roti / Naan',
                'description' => 'Indian breads',
                'display_order' => 6,
                'status' => 'active',
            ],
            [
                'name' => 'Starters',
                'description' => 'Appetizers and starters',
                'display_order' => 7,
                'status' => 'active',
            ],
            [
                'name' => 'Beverages',
                'description' => 'Drinks and beverages',
                'display_order' => 8,
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            FoodCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}

