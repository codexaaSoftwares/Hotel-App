<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get room categories
        $standardCategory = RoomCategory::where('name', 'Standard')->first();
        $deluxeCategory = RoomCategory::where('name', 'Deluxe')->first();
        $suiteCategory = RoomCategory::where('name', 'Suite')->first();
        $familyCategory = RoomCategory::where('name', 'Family')->first();

        // If categories don't exist, create them first
        if (!$standardCategory) {
            $standardCategory = RoomCategory::create([
                'name' => 'Standard',
                'description' => 'Standard rooms with basic amenities',
                'base_price' => 1500.00,
                'max_adults' => 2,
                'max_children' => 1,
                'status' => 'active',
            ]);
        }
        if (!$deluxeCategory) {
            $deluxeCategory = RoomCategory::create([
                'name' => 'Deluxe',
                'description' => 'Deluxe rooms with enhanced amenities',
                'base_price' => 2500.00,
                'max_adults' => 3,
                'max_children' => 2,
                'status' => 'active',
            ]);
        }
        if (!$suiteCategory) {
            $suiteCategory = RoomCategory::create([
                'name' => 'Suite',
                'description' => 'Luxury suites with premium amenities',
                'base_price' => 5000.00,
                'max_adults' => 4,
                'max_children' => 2,
                'status' => 'active',
            ]);
        }
        if (!$familyCategory) {
            $familyCategory = RoomCategory::create([
                'name' => 'Family',
                'description' => 'Family rooms suitable for larger groups',
                'base_price' => 3500.00,
                'max_adults' => 4,
                'max_children' => 3,
                'status' => 'active',
            ]);
        }

        $rooms = [
            // Floor 1 - Standard Rooms
            [
                'room_number' => '101',
                'room_category_id' => $standardCategory->id,
                'floor_number' => 1,
                'bed_type' => 'double',
                'max_occupancy' => 2,
                'room_price' => null,
                'status' => 'available',
                'notes' => 'Window facing room',
                'is_active' => true,
            ],
            [
                'room_number' => '102',
                'room_category_id' => $standardCategory->id,
                'floor_number' => 1,
                'bed_type' => 'double',
                'max_occupancy' => 2,
                'room_price' => null,
                'status' => 'available',
                'notes' => null,
                'is_active' => true,
            ],
            [
                'room_number' => '103',
                'room_category_id' => $standardCategory->id,
                'floor_number' => 1,
                'bed_type' => 'twin',
                'max_occupancy' => 2,
                'room_price' => null,
                'status' => 'occupied',
                'notes' => null,
                'is_active' => true,
            ],
            [
                'room_number' => '104',
                'room_category_id' => $standardCategory->id,
                'floor_number' => 1,
                'bed_type' => 'double',
                'max_occupancy' => 2,
                'room_price' => null,
                'status' => 'cleaning',
                'notes' => null,
                'is_active' => true,
            ],
            [
                'room_number' => '105',
                'room_category_id' => $standardCategory->id,
                'floor_number' => 1,
                'bed_type' => 'single',
                'max_occupancy' => 1,
                'room_price' => 1200.00, // Custom price override
                'status' => 'available',
                'notes' => 'Single occupancy room',
                'is_active' => true,
            ],

            // Floor 2 - Deluxe Rooms
            [
                'room_number' => '201',
                'room_category_id' => $deluxeCategory->id,
                'floor_number' => 2,
                'bed_type' => 'king',
                'max_occupancy' => 3,
                'room_price' => null,
                'status' => 'available',
                'notes' => 'Corner room with balcony',
                'is_active' => true,
            ],
            [
                'room_number' => '202',
                'room_category_id' => $deluxeCategory->id,
                'floor_number' => 2,
                'bed_type' => 'queen',
                'max_occupancy' => 3,
                'room_price' => null,
                'status' => 'reserved',
                'notes' => null,
                'is_active' => true,
            ],
            [
                'room_number' => '203',
                'room_category_id' => $deluxeCategory->id,
                'floor_number' => 2,
                'bed_type' => 'king',
                'max_occupancy' => 3,
                'room_price' => 2800.00, // Custom price override
                'status' => 'available',
                'notes' => 'Premium deluxe room',
                'is_active' => true,
            ],
            [
                'room_number' => '204',
                'room_category_id' => $deluxeCategory->id,
                'floor_number' => 2,
                'bed_type' => 'queen',
                'max_occupancy' => 3,
                'room_price' => null,
                'status' => 'available',
                'notes' => null,
                'is_active' => true,
            ],
            [
                'room_number' => '205',
                'room_category_id' => $deluxeCategory->id,
                'floor_number' => 2,
                'bed_type' => 'king',
                'max_occupancy' => 3,
                'room_price' => null,
                'status' => 'occupied',
                'notes' => null,
                'is_active' => true,
            ],

            // Floor 3 - Suite and Family Rooms
            [
                'room_number' => '301',
                'room_category_id' => $suiteCategory->id,
                'floor_number' => 3,
                'bed_type' => 'king',
                'max_occupancy' => 4,
                'room_price' => null,
                'status' => 'available',
                'notes' => 'Executive suite with living area',
                'is_active' => true,
            ],
            [
                'room_number' => '302',
                'room_category_id' => $suiteCategory->id,
                'floor_number' => 3,
                'bed_type' => 'king',
                'max_occupancy' => 4,
                'room_price' => 5500.00, // Custom price override
                'status' => 'reserved',
                'notes' => 'Presidential suite',
                'is_active' => true,
            ],
            [
                'room_number' => '303',
                'room_category_id' => $familyCategory->id,
                'floor_number' => 3,
                'bed_type' => 'double',
                'max_occupancy' => 5,
                'room_price' => null,
                'status' => 'available',
                'notes' => 'Family room with extra bed',
                'is_active' => true,
            ],
            [
                'room_number' => '304',
                'room_category_id' => $familyCategory->id,
                'floor_number' => 3,
                'bed_type' => 'queen',
                'max_occupancy' => 5,
                'room_price' => null,
                'status' => 'available',
                'notes' => null,
                'is_active' => true,
            ],
            [
                'room_number' => '305',
                'room_category_id' => $standardCategory->id,
                'floor_number' => 3,
                'bed_type' => 'double',
                'max_occupancy' => 2,
                'room_price' => null,
                'status' => 'maintenance',
                'notes' => 'Under maintenance - AC repair',
                'is_active' => false,
            ],
        ];

        foreach ($rooms as $room) {
            Room::updateOrCreate(
                ['room_number' => $room['room_number']],
                $room
            );
        }
    }
}

