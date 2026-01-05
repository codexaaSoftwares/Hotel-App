<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FinancialCategory;

class FinancialCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            // Income Categories (5 records)
            [
                'type' => 'income',
                'name' => 'Photography Services',
                'description' => 'Revenue from photography sessions (weddings, portraits, events, etc.)',
                'status' => 'active',
            ],
            [
                'type' => 'income',
                'name' => 'Video Services',
                'description' => 'Revenue from videography services (wedding videos, event coverage, etc.)',
                'status' => 'active',
            ],
            [
                'type' => 'income',
                'name' => 'Print Sales',
                'description' => 'Revenue from photo prints and enlargements',
                'status' => 'active',
            ],
            [
                'type' => 'income',
                'name' => 'Album Sales',
                'description' => 'Revenue from photo albums and books',
                'status' => 'active',
            ],
            [
                'type' => 'income',
                'name' => 'Additional Services',
                'description' => 'Revenue from additional services (retouching, editing, framing, etc.)',
                'status' => 'active',
            ],

            // Expense Categories (5 records)
            [
                'type' => 'expense',
                'name' => 'Equipment Purchase',
                'description' => 'Expenses for purchasing cameras, lenses, lighting equipment, etc.',
                'status' => 'active',
            ],
            [
                'type' => 'expense',
                'name' => 'Equipment Maintenance',
                'description' => 'Expenses for equipment repair, servicing, and maintenance',
                'status' => 'active',
            ],
            [
                'type' => 'expense',
                'name' => 'Studio Rent',
                'description' => 'Monthly rent for studio space',
                'status' => 'active',
            ],
            [
                'type' => 'expense',
                'name' => 'Utilities',
                'description' => 'Electricity, water, internet, and other utility bills',
                'status' => 'active',
            ],
            [
                'type' => 'expense',
                'name' => 'Marketing & Advertising',
                'description' => 'Expenses for marketing campaigns, social media ads, print ads, etc.',
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            FinancialCategory::updateOrCreate(
                [
                    'type' => $category['type'],
                    'name' => $category['name'],
                ],
                $category
            );
        }

        $this->command->info('Financial categories seeded successfully!');
    }
}
