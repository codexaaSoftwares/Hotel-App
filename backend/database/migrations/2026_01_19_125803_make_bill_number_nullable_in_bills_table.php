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
        // Use raw SQL to avoid requiring Doctrine DBAL
        DB::statement('ALTER TABLE `bills` MODIFY `bill_number` VARCHAR(50) NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // First, update any NULL values to a temporary value
        DB::statement("UPDATE `bills` SET `bill_number` = CONCAT('TEMP-', id) WHERE `bill_number` IS NULL");
        
        // Then make it NOT NULL
        DB::statement('ALTER TABLE `bills` MODIFY `bill_number` VARCHAR(50) NOT NULL');
    }
};
