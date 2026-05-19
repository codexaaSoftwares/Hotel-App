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
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'total_bills',
                'total_amount',
                'paid_amount',
                'remaining_amount',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->integer('total_bills')->default(0)->after('customer_type');
            $table->decimal('total_amount', 12, 2)->default(0.00)->after('total_bills');
            $table->decimal('paid_amount', 12, 2)->default(0.00)->after('total_amount');
            $table->decimal('remaining_amount', 12, 2)->default(0.00)->after('paid_amount');
        });
    }
};

