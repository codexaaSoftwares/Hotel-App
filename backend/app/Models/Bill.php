<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bill extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bill_number',
        'table_id',
        'customer_id',
        'bill_date',
        'status',
        'payment_status',
        'subtotal',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'service_tax_amount',
        'discount',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'payment_method',
        'gst_calculation_method',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bill_date' => 'datetime',
        'subtotal' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'cgst_amount' => 'decimal:2',
        'sgst_amount' => 'decimal:2',
        'service_tax_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the table that owns the bill.
     */
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    /**
     * Get the customer that owns the bill.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the bill items for the bill.
     */
    public function billItems()
    {
        return $this->hasMany(BillItem::class)->orderBy('display_order', 'asc');
    }

    /**
     * Get the wallet transactions for the bill.
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Get the user who created the bill.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate a unique bill number based on bill ID.
     *
     * @param int $billId The bill ID
     * @return string
     */
    public static function generateBillNumber($billId)
    {
        return '#BILL' . $billId;
    }
}

