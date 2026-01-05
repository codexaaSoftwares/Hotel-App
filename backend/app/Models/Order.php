<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, SoftDeletes;    

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_number',
        'customer_id',
        'branch_id',
        'order_date',
        'due_date',
        'subtotal',
        'discount',
        'total_amount',
        'status',
        'notes',
        'timeline',
        'links',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'order_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'timeline' => 'array',
        'links' => 'array',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the customer that owns the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the branch that owns the order.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the order items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the payments for the order.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Update order subtotal from items.
     */
    public function updateSubtotal(): void
    {
        $this->subtotal = $this->items()->sum('total_price');
        $this->total_amount = $this->subtotal - $this->discount;
        $this->save();
    }

    /**
     * Scope a query to only include orders by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
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

    public function getPaymentStatusAttribute(): string
    {
        $total = (float) $this->total_amount;
        if ($total <= 0) {
            return 'pending';
        }

        return $this->remaining_amount <= 0 ? 'completed' : 'pending';
    }

    public function getPaymentMethodAttribute(): ?string
    {
        $latestPayment = $this->payments()
            ->orderByDesc('payment_date')
            ->orderByDesc('id')
            ->first();

        return $latestPayment?->payment_method;
    }
}
