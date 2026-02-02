<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use PaginatesResults;

    /**
     * Get Sales Report
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function salesReport(Request $request)
    {
        $query = Bill::with(['table', 'customer', 'creator']);

        // Date range filter (required for reports)
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('bill_date', '>=', $startDate);
        } else {
            // Default to current month if no date provided
            $query->whereMonth('bill_date', now()->month)
                  ->whereYear('bill_date', now()->year);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('bill_date', '<=', $endDate);
        }

        // Payment status filter
        if ($paymentStatus = $request->input('payment_status')) {
            if ($paymentStatus !== 'all') {
                $query->where('payment_status', $paymentStatus);
            }
        }

        // Payment method filter
        if ($request->has('payment_method')) {
            $paymentMethod = $request->input('payment_method');
            if ($paymentMethod && $paymentMethod !== 'all') {
                if ($paymentMethod === 'null') {
                    $query->whereNull('payment_method');
                } else {
                    $query->where('payment_method', $paymentMethod);
                }
            }
        }

        // Table filter
        if ($tableId = $request->input('table_id')) {
            $query->where('table_id', $tableId);
        }

        // Customer filter
        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        // Get all bills (no pagination for reports, or optional pagination)
        $bills = $query->orderBy('bill_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->get();

        // Calculate summary statistics
        $summary = [
            'totalSalesAmount' => (float) $bills->sum('total_amount'),
            'totalBillsCount' => $bills->count(),
            'paidBillsCount' => $bills->where('payment_status', 'paid')->count(),
            'pendingBillsCount' => $bills->where('payment_status', 'pending')->count(),
            'partialBillsCount' => $bills->where('payment_status', 'partial')->count(),
            'totalSubtotal' => (float) $bills->sum('subtotal'),
            'totalDiscount' => (float) $bills->sum('discount'),
            'totalCgstAmount' => (float) $bills->sum('cgst_amount'),
            'totalSgstAmount' => (float) $bills->sum('sgst_amount'),
            'totalServiceTaxAmount' => (float) $bills->sum('service_tax_amount'),
        ];

        // Transform bills to resource
        $billsData = BillResource::collection($bills->load('billItems'))->toArray($request);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'bills' => $billsData,
            ],
        ], 200);
    }
}

