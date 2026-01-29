<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'mobile',
        'department',
        'salary_type',
        'salary_amount',
        'joining_date',
        'address',
        'document_info',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'salary_amount' => 'decimal:2',
        'joining_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope a query to only include active staff.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get the salary payments for the staff.
     */
    public function salaryPayments()
    {
        return $this->hasMany(SalaryPayment::class);
    }
}
