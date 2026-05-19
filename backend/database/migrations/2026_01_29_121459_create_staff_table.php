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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mobile', 20)->nullable();
            $table->string('department')->nullable();
            $table->enum('salary_type', ['monthly', 'other'])->default('monthly');
            $table->decimal('salary_amount', 12, 2)->default(0.00);
            $table->date('joining_date')->nullable();
            $table->text('address')->nullable();
            $table->text('document_info')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('department');
            $table->index('salary_type');
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
        Schema::dropIfExists('staff');
    }
};
