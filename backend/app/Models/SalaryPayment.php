<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryPayment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'staff_id',
        'month',
        'year',
        'paid_amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'paid_amount' => 'decimal:2',
        'payment_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the staff member that owns the salary payment.
     * Includes soft-deleted staff to preserve historical salary payment records.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class)->withTrashed();
    }

    /**
     * Get the user who created the salary payment.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
