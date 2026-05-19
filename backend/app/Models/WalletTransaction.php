<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WalletTransaction extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'bill_id',
        'transaction_type',
        'amount',
        'payment_method',
        'transaction_date',
        'description',
        'reference_number',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope a query to only include credit transactions.
     */
    public function scopeCredit($query)
    {
        return $query->where('transaction_type', 'credit');
    }

    /**
     * Scope a query to only include debit transactions.
     */
    public function scopeDebit($query)
    {
        return $query->where('transaction_type', 'debit');
    }

    /**
     * Get the customer that owns the wallet transaction.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the bill associated with the wallet transaction.
     */
    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    /**
     * Get the user who created the wallet transaction.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

