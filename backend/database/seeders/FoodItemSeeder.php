<?php

namespace Database\Seeders;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Database\Seeder;

class FoodItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get categories by name for easy lookup
        $categories = FoodCategory::all()->keyBy('name');

        $items = [
            // Punjabi Sabji
            ['category' => 'Punjabi Sabji', 'name' => 'Paneer Butter Masala', 'price' => 180.00, 'display_order' => 1],
            ['category' => 'Punjabi Sabji', 'name' => 'Paneer Tufani', 'price' => 190.00, 'display_order' => 2],
            ['category' => 'Punjabi Sabji', 'name' => 'Paneer Handi', 'price' => 190.00, 'display_order' => 3],
            ['category' => 'Punjabi Sabji', 'name' => 'Paneer Kadai', 'price' => 180.00, 'display_order' => 4],
            ['category' => 'Punjabi Sabji', 'name' => 'Kaju Kari', 'price' => 200.00, 'display_order' => 5],
            ['category' => 'Punjabi Sabji', 'name' => 'Veg Kolhapuri', 'price' => 160.00, 'display_order' => 6],
            ['category' => 'Punjabi Sabji', 'name' => 'Mix Veg', 'price' => 150.00, 'display_order' => 7],
            ['category' => 'Punjabi Sabji', 'name' => 'Sev Tameta', 'price' => 140.00, 'display_order' => 8],

            // Chinese Sabji
            ['category' => 'Chinese Sabji', 'name' => 'Veg Manchurian', 'price' => 160.00, 'display_order' => 1],
            ['category' => 'Chinese Sabji', 'name' => 'Paneer Chilli', 'price' => 180.00, 'display_order' => 2],
            ['category' => 'Chinese Sabji', 'name' => 'Paneer Manchurian', 'price' => 180.00, 'display_order' => 3],
            ['category' => 'Chinese Sabji', 'name' => 'Veg Hong Kong', 'price' => 160.00, 'display_order' => 4],
            ['category' => 'Chinese Sabji', 'name' => 'Veg Garlic', 'price' => 150.00, 'display_order' => 5],

            // Chinese Rice
            ['category' => 'Chinese Rice', 'name' => 'Veg Fried Rice', 'price' => 120.00, 'display_order' => 1],
            ['category' => 'Chinese Rice', 'name' => 'Veg Schezwan Rice', 'price' => 130.00, 'display_order' => 2],
            ['category' => 'Chinese Rice', 'name' => 'Veg Triple Rice', 'price' => 160.00, 'display_order' => 3],
            ['category' => 'Chinese Rice', 'name' => 'Veg Manchurian Rice', 'price' => 150.00, 'display_order' => 4],

            // Chinese Noodles
            ['category' => 'Chinese Noodles', 'name' => 'Veg Hakka Noodles', 'price' => 120.00, 'display_order' => 1],
            ['category' => 'Chinese Noodles', 'name' => 'Veg Schezwan Noodles', 'price' => 130.00, 'display_order' => 2],
            ['category' => 'Chinese Noodles', 'name' => 'Veg Triple Noodles', 'price' => 160.00, 'display_order' => 3],

            // Rice / Biryani
            ['category' => 'Rice / Biryani', 'name' => 'Plain Rice', 'price' => 90.00, 'display_order' => 1],
            ['category' => 'Rice / Biryani', 'name' => 'Jeera Rice', 'price' => 110.00, 'display_order' => 2],
            ['category' => 'Rice / Biryani', 'name' => 'Veg Pulao', 'price' => 130.00, 'display_order' => 3],
            ['category' => 'Rice / Biryani', 'name' => 'Veg Biryani', 'price' => 150.00, 'display_order' => 4],

            // Roti / Naan
            ['category' => 'Roti / Naan', 'name' => 'Tawa Roti', 'price' => 15.00, 'display_order' => 1],
            ['category' => 'Roti / Naan', 'name' => 'Butter Roti', 'price' => 20.00, 'display_order' => 2],
            ['category' => 'Roti / Naan', 'name' => 'Plain Naan', 'price' => 30.00, 'display_order' => 3],
            ['category' => 'Roti / Naan', 'name' => 'Butter Naan', 'price' => 35.00, 'display_order' => 4],
            ['category' => 'Roti / Naan', 'name' => 'Garlic Naan', 'price' => 40.00, 'display_order' => 5],

            // Starters
            ['category' => 'Starters', 'name' => 'Paneer Tikka', 'price' => 180.00, 'display_order' => 1],
            ['category' => 'Starters', 'name' => 'Veg Crispy', 'price' => 160.00, 'display_order' => 2],
            ['category' => 'Starters', 'name' => 'Veg Manchurian Dry', 'price' => 160.00, 'display_order' => 3],
            ['category' => 'Starters', 'name' => 'Paneer Chilli Dry', 'price' => 180.00, 'display_order' => 4],

            // Beverages
            ['category' => 'Beverages', 'name' => 'Tea', 'price' => 20.00, 'display_order' => 1],
            ['category' => 'Beverages', 'name' => 'Coffee', 'price' => 30.00, 'display_order' => 2],
            ['category' => 'Beverages', 'name' => 'Butter Milk', 'price' => 25.00, 'display_order' => 3],
            ['category' => 'Beverages', 'name' => 'Cold Drink', 'price' => 40.00, 'display_order' => 4],
        ];

        foreach ($items as $item) {
            $category = $categories->get($item['category']);
            
            if (!$category) {
                $this->command->warn("Category '{$item['category']}' not found. Skipping item '{$item['name']}'.");
                continue;
            }

            FoodItem::updateOrCreate(
                [
                    'name' => $item['name'],
                    'food_category_id' => $category->id,
                ],
                [
                    'price' => $item['price'],
                    'food_type' => 'veg', // All items are vegetarian
                    'status' => 'active',
                    'display_order' => $item['display_order'],
                ]
            );
        }
    }
}

