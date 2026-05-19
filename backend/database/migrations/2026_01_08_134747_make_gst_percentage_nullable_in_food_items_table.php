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
        // Use raw SQL to avoid Doctrine DBAL requirement
        DB::statement('ALTER TABLE food_items MODIFY COLUMN gst_percentage DECIMAL(5,2) NULL DEFAULT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert to non-nullable with default 0
        DB::statement('ALTER TABLE food_items MODIFY COLUMN gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0');
    }
};
