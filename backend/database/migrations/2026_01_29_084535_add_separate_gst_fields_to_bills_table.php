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
        Schema::table('bills', function (Blueprint $table) {
            // Add separate GST fields
            $table->decimal('cgst_amount', 12, 2)->default(0.00)->after('gst_amount');
            $table->decimal('sgst_amount', 12, 2)->default(0.00)->after('cgst_amount');
            $table->decimal('service_tax_amount', 12, 2)->default(0.00)->after('sgst_amount');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn(['cgst_amount', 'sgst_amount', 'service_tax_amount']);
        });
    }
};
