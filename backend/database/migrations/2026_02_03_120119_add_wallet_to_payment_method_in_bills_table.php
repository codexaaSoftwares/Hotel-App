<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Modify the payment_method enum to include 'wallet'
        DB::statement("ALTER TABLE bills MODIFY COLUMN payment_method ENUM('cash', 'upi', 'card', 'split', 'wallet') NULL");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert to original enum values (remove 'wallet')
        // Note: This will fail if there are any bills with payment_method = 'wallet'
        // In that case, you would need to update those records first
        DB::statement("ALTER TABLE bills MODIFY COLUMN payment_method ENUM('cash', 'upi', 'card', 'split') NULL");
    }
};
