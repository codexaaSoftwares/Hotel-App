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
        Schema::create('food_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('food_category_id')->constrained('food_categories')->onDelete('restrict');
            $table->decimal('price', 10, 2);
            $table->decimal('gst_percentage', 5, 2)->default(0);
            $table->enum('food_type', ['veg', 'non_veg'])->default('veg');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('food_category_id');
            $table->index('status');
            $table->index('food_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('food_items');
    }
};

