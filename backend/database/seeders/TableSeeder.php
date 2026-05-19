<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $tables = [
            [
                'table_number' => 'T1',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T2',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T3',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'occupied',
                'is_active' => true,
            ],
            [
                'table_number' => 'T4',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T5',
                'table_name' => null,
                'capacity' => 6,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T6',
                'table_name' => null,
                'capacity' => 6,
                'status' => 'reserved',
                'is_active' => true,
            ],
            [
                'table_number' => 'T7',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T8',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'cleaning',
                'is_active' => true,
            ],
            [
                'table_number' => 'T9',
                'table_name' => null,
                'capacity' => 2,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T10',
                'table_name' => null,
                'capacity' => 2,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'Family-1',
                'table_name' => 'Family Table 1',
                'capacity' => 8,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'Family-2',
                'table_name' => 'Family Table 2',
                'capacity' => 8,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'VIP-1',
                'table_name' => 'VIP Table',
                'capacity' => 6,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'Window-1',
                'table_name' => 'Window Table',
                'capacity' => 4,
                'status' => 'available',
                'is_active' => true,
            ],
            [
                'table_number' => 'T11',
                'table_name' => null,
                'capacity' => 4,
                'status' => 'maintenance',
                'is_active' => false,
            ],
        ];

        foreach ($tables as $table) {
            Table::updateOrCreate(
                ['table_number' => $table['table_number']],
                $table
            );
        }
    }
}

