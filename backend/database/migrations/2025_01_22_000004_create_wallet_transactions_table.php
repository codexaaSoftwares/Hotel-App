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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->foreignId('bill_id')->nullable()->constrained('bills')->onDelete('set null');
            $table->enum('transaction_type', ['credit', 'debit']);
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['cash', 'upi', 'card', 'bank_transfer'])->nullable();
            $table->dateTime('transaction_date');
            $table->text('description')->nullable();
            $table->string('reference_number', 255)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('customer_id'); // Customer ledger queries
            $table->index('bill_id'); // Bill payment tracking
            $table->index('transaction_date'); // Date range queries
            $table->index('transaction_type'); // Filter credit/debit
            $table->index('created_at'); // Recent transactions
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallet_transactions');
    }
};

