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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number', 50)->unique();
            $table->foreignId('room_category_id')->constrained('room_categories')->onDelete('restrict');
            $table->integer('floor_number')->default(1);
            $table->enum('bed_type', ['single', 'double', 'king', 'queen', 'twin'])->default('double');
            $table->integer('max_occupancy')->default(2);
            $table->decimal('room_price', 10, 2)->nullable();
            $table->enum('status', ['available', 'occupied', 'cleaning', 'maintenance', 'reserved'])->default('available');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('room_category_id');
            $table->index('status');
            $table->index('is_active');
            $table->index('floor_number');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rooms');
    }
};

