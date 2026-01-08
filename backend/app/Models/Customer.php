<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_code',
        'name',
        'mobile',
        'email',
        'address',
        'city',
        'state',
        'pincode',
        'customer_type',
        'total_bills',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_bills' => 'integer',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope a query to only include active customers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include credit customers.
     */
    public function scopeCredit($query)
    {
        return $query->where('customer_type', 'credit');
    }

    /**
     * Scope a query to only include regular customers.
     */
    public function scopeRegular($query)
    {
        return $query->where('customer_type', 'regular');
    }

    /**
     * Get the bills for the customer.
     */
    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    /**
     * Get the wallet transactions for the customer.
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->customer_code)) {
                $customer->customer_code = static::generateCustomerCode();
            }
        });
    }

    /**
     * Generate a unique customer code.
     *
     * @return string
     */
    protected static function generateCustomerCode()
    {
        $lastCustomer = static::withTrashed()
            ->whereNotNull('customer_code')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastCustomer && preg_match('/#CUST(\d+)/', $lastCustomer->customer_code, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        } else {
            $nextNumber = 1;
        }

        return '#CUST' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}

