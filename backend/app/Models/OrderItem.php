<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'package_id',
        'quantity',
        'unit_price',
        'total_price',
        'package_name',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Calculate total_price before saving
        static::saving(function ($item) {
            if ($item->quantity && $item->unit_price) {
                $item->total_price = $item->quantity * $item->unit_price;
            }
        });

        // Update order subtotal when item is saved
        static::saved(function ($item) {
            $item->order->updateSubtotal();
        });

        // Update order subtotal when item is deleted
        static::deleted(function ($item) {
            if ($item->order) {
                $item->order->updateSubtotal();
            }
        });
    }

    /**
     * Get the order that owns the order item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the package that owns the order item.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
