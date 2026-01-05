<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Models\Payment;

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
        'job_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'mobile',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'branch_id',
        'status',
        'dob',
        'anniversary_date',
        'notes',
        'preferences',
        'avatar',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'dob' => 'date',
        'anniversary_date' => 'date',
        'preferences' => 'array',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the branch that owns the customer.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Booted model hook.
     */
    protected static function booted(): void
    {
        static::deleting(function (Customer $customer) {
            $orders = $customer->isForceDeleting()
                ? $customer->orders()->withTrashed()->get()
                : $customer->orders()->get();

            $payments = $customer->isForceDeleting()
                ? $customer->payments()->withTrashed()->get()
                : $customer->payments()->get();

            $orders->each(function ($order) use ($customer) {
                $customer->isForceDeleting() ? $order->forceDelete() : $order->delete();
            });

            $payments->each(function ($payment) use ($customer) {
                $customer->isForceDeleting() ? $payment->forceDelete() : $payment->delete();
            });
        });
    }

    /**
     * Get the orders for the customer.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the payments for the customer.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get all order items associated with the customer.
     */
    public function orderItems(): HasManyThrough
    {
        return $this->hasManyThrough(OrderItem::class, Order::class);
    }

    /**
     * Scope a query to only include active customers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Statistics are derived on the fly now.
     */
    public function recalculateStats(): void
    {
        // No-op: values are calculated dynamically via accessors.
    }

    /**
     * Get full name attribute (computed).
     * Note: This is an accessor, not a database column.
     */
    public function getNameAttribute()
    {
        return trim($this->first_name . ' ' . ($this->last_name ?? ''));
    }

    public function getTotalOrdersAttribute(): int
    {
        if ($this->relationLoaded('orders')) {
            return $this->orders->count();
        }

        return (int) $this->orders()->count();
    }

    public function getTotalServicesAttribute(): int
    {
        if ($this->relationLoaded('orderItems')) {
            return (int) $this->orderItems->sum('quantity');
        }

        return (int) $this->orderItems()->sum('quantity');
    }

    public function getTotalAmountAttribute(): float
    {
        if ($this->relationLoaded('orders')) {
            return (float) $this->orders->sum('total_amount');
        }

        return (float) $this->orders()->sum('total_amount');
    }

    public function getPaidAmountAttribute(): float
    {
        $credits = $this->payments()
            ->where('payment_type', 'credit')
            ->sum('amount');

        $debits = $this->payments()
            ->where('payment_type', 'debit')
            ->sum('amount');

        return (float) max(0, $credits - $debits);
    }

    public function getRemainingAmountAttribute(): float
    {
        return (float) max(0, $this->total_amount - $this->paid_amount);
    }

    public function getWalletBalanceAttribute(): float
    {
        return (float) max(0, $this->paid_amount - $this->total_amount);
    }

    public function getLastOrderDateAttribute()
    {
        if ($this->relationLoaded('orders') && $this->orders->isNotEmpty()) {
            return $this->orders->max('order_date');
        }

        return $this->orders()
            ->latest('order_date')
            ->value('order_date');
    }
}
