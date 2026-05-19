<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bill_id',
        'food_item_id',
        'item_name',
        'quantity',
        'unit_price',
        'gst_percentage',
        'gst_amount',
        'total_price',
        'display_order',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'gst_percentage' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'display_order' => 'integer',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the bill that owns the bill item.
     */
    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    /**
     * Get the food item that owns the bill item.
     */
    public function foodItem()
    {
        return $this->belongsTo(FoodItem::class);
    }
}

