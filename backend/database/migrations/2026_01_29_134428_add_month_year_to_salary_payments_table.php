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
        Schema::table('salary_payments', function (Blueprint $table) {
            $table->tinyInteger('month')->nullable()->after('staff_id');
            $table->year('year')->nullable()->after('month');
            
            // Add indexes for month and year for better query performance
            $table->index(['month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('salary_payments', function (Blueprint $table) {
            $table->dropIndex(['month', 'year']);
            $table->dropColumn(['month', 'year']);
        });
    }
};
