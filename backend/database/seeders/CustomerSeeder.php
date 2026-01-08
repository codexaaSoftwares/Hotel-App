<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $customers = [
            [
                'name' => 'Rajesh Kumar',
                'mobile' => '9876543210',
                'email' => 'rajesh.kumar@example.com',
                'address' => '123 Main Street',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pincode' => '400001',
                'customer_type' => 'regular',
                'status' => 'active',
                'notes' => 'Regular customer, prefers vegetarian food',
            ],
            [
                'name' => 'Priya Sharma',
                'mobile' => '9876543211',
                'email' => 'priya.sharma@example.com',
                'address' => '456 Park Avenue',
                'city' => 'Delhi',
                'state' => 'Delhi',
                'pincode' => '110001',
                'customer_type' => 'credit',
                'status' => 'active',
                'notes' => 'Credit customer, monthly payment',
            ],
            [
                'name' => 'Amit Patel',
                'mobile' => '9876543212',
                'email' => null,
                'address' => '789 Business Road',
                'city' => 'Ahmedabad',
                'state' => 'Gujarat',
                'pincode' => '380001',
                'customer_type' => 'regular',
                'status' => 'active',
                'notes' => null,
            ],
            [
                'name' => 'Sneha Desai',
                'mobile' => '9876543213',
                'email' => 'sneha.desai@example.com',
                'address' => '321 Garden Street',
                'city' => 'Pune',
                'state' => 'Maharashtra',
                'pincode' => '411001',
                'customer_type' => 'credit',
                'status' => 'active',
                'notes' => 'Frequent customer, prefers spicy food',
            ],
            [
                'name' => 'Vikram Singh',
                'mobile' => '9876543214',
                'email' => 'vikram.singh@example.com',
                'address' => '654 Market Lane',
                'city' => 'Bangalore',
                'state' => 'Karnataka',
                'pincode' => '560001',
                'customer_type' => 'regular',
                'status' => 'active',
                'notes' => null,
            ],
            [
                'name' => 'Anjali Mehta',
                'mobile' => '9876543215',
                'email' => null,
                'address' => '987 Hill Road',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pincode' => '400050',
                'customer_type' => 'regular',
                'status' => 'active',
                'notes' => 'Walk-in customer',
            ],
            [
                'name' => 'Rahul Gupta',
                'mobile' => '9876543216',
                'email' => 'rahul.gupta@example.com',
                'address' => '147 Commercial Street',
                'city' => 'Kolkata',
                'state' => 'West Bengal',
                'pincode' => '700001',
                'customer_type' => 'credit',
                'status' => 'active',
                'notes' => 'Corporate customer, bulk orders',
            ],
            [
                'name' => 'Kavita Reddy',
                'mobile' => '9876543217',
                'email' => 'kavita.reddy@example.com',
                'address' => '258 Tech Park',
                'city' => 'Hyderabad',
                'state' => 'Telangana',
                'pincode' => '500001',
                'customer_type' => 'regular',
                'status' => 'active',
                'notes' => null,
            ],
            [
                'name' => 'Mohammed Ali',
                'mobile' => '9876543218',
                'email' => null,
                'address' => '369 Old City',
                'city' => 'Lucknow',
                'state' => 'Uttar Pradesh',
                'pincode' => '226001',
                'customer_type' => 'regular',
                'status' => 'inactive',
                'notes' => 'Inactive customer',
            ],
            [
                'name' => 'Sunita Joshi',
                'mobile' => '9876543219',
                'email' => 'sunita.joshi@example.com',
                'address' => '741 New Colony',
                'city' => 'Jaipur',
                'state' => 'Rajasthan',
                'pincode' => '302001',
                'customer_type' => 'credit',
                'status' => 'active',
                'notes' => 'Family customer, prefers non-veg',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['mobile' => $customer['mobile']],
                $customer
            );
        }
    }
}

