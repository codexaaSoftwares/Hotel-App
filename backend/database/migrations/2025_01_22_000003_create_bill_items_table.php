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
        Schema::create('bill_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')->constrained('bills')->onDelete('cascade');
            $table->foreignId('food_item_id')->constrained('food_items')->onDelete('restrict');
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('gst_percentage', 5, 2)->nullable();
            $table->decimal('gst_amount', 10, 2)->default(0.00);
            $table->decimal('total_price', 12, 2);
            $table->integer('display_order')->default(0);
            $table->string('notes', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Critical Indexes for Performance
            $table->index('bill_id'); // Most important - fetching items for a bill
            $table->index('food_item_id'); // Popular items reports
            $table->index('created_at'); // Date range queries
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bill_items');
    }
};

