<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Use raw SQL to change column type (avoids Doctrine DBAL requirement)
        \DB::statement("ALTER TABLE `packages` MODIFY COLUMN `package_type` VARCHAR(255) NOT NULL DEFAULT 'Album'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert back to ENUM (only if needed for rollback)
        \DB::statement("ALTER TABLE `packages` MODIFY COLUMN `package_type` ENUM('Album', 'PhotoShoot', 'Editing', 'Video') NOT NULL DEFAULT 'Album'");
    }
};
