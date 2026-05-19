<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExpenseCategory;

class ExpenseCategorySeeder extends Seeder
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
                'name' => 'Rent',
                'description' => 'Monthly rent for restaurant/hotel premises',
                'status' => 'active',
            ],
            [
                'name' => 'Utilities',
                'description' => 'Electricity, water, gas bills',
                'status' => 'active',
            ],
            [
                'name' => 'Kitchen Supplies',
                'description' => 'Raw materials, ingredients, and kitchen supplies',
                'status' => 'active',
            ],
            [
                'name' => 'Maintenance',
                'description' => 'Equipment maintenance and repairs',
                'status' => 'active',
            ],
            [
                'name' => 'Marketing',
                'description' => 'Advertising, promotions, and marketing expenses',
                'status' => 'active',
            ],
            [
                'name' => 'Staff Expenses',
                'description' => 'Staff uniforms, training, and related expenses',
                'status' => 'active',
            ],
            [
                'name' => 'Cleaning Supplies',
                'description' => 'Cleaning materials and housekeeping supplies',
                'status' => 'active',
            ],
            [
                'name' => 'Insurance',
                'description' => 'Business insurance and liability coverage',
                'status' => 'active',
            ],
            [
                'name' => 'License & Permits',
                'description' => 'Business licenses, permits, and regulatory fees',
                'status' => 'active',
            ],
            [
                'name' => 'Miscellaneous',
                'description' => 'Other miscellaneous expenses',
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}

