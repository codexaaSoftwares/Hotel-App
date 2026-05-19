<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'room_number',
        'room_category_id',
        'floor_number',
        'bed_type',
        'max_occupancy',
        'room_price',
        'status',
        'notes',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'room_category_id' => 'integer',
        'floor_number' => 'integer',
        'max_occupancy' => 'integer',
        'room_price' => 'decimal:2',
        'status' => 'string',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope a query to only include active rooms.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include available rooms.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include occupied rooms.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    /**
     * Get the room category that owns the room.
     */
    public function roomCategory()
    {
        return $this->belongsTo(RoomCategory::class);
    }

    /**
     * Get the effective price for the room.
     * Returns room_price if set, otherwise returns category base_price.
     *
     * @return float
     */
    public function getEffectivePriceAttribute()
    {
        return $this->room_price ?? $this->roomCategory->base_price ?? 0;
    }
}

