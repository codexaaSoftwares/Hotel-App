<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Resources\BillResource;
use App\Http\Resources\ExpenseResource;
use App\Models\Bill;
use App\Models\Expense;
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

    /**
     * Get Expense Report
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function expenseReport(Request $request)
    {
        $query = Expense::with(['category', 'creator']);

        // Date range filter (required for reports)
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('expense_date', '>=', $startDate);
        } else {
            // Default to current month if no date provided
            $query->whereMonth('expense_date', now()->month)
                  ->whereYear('expense_date', now()->year);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('expense_date', '<=', $endDate);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            if ($categoryId !== 'all') {
                $query->where('category_id', $categoryId);
            }
        }

        // Payment method filter
        if ($paymentMethod = $request->input('payment_method')) {
            if ($paymentMethod !== 'all') {
                $query->where('payment_method', $paymentMethod);
            }
        }

        // Get all expenses (no pagination for reports)
        $expenses = $query->orderBy('expense_date', 'desc')
                         ->orderBy('created_at', 'desc')
                         ->get();

        // Calculate summary statistics
        $totalExpenses = (float) $expenses->sum('amount');
        $totalCount = $expenses->count();
        
        // Calculate this month expenses
        $thisMonthExpenses = Expense::whereMonth('expense_date', now()->month)
                                   ->whereYear('expense_date', now()->year)
                                   ->sum('amount');
        
        // Calculate today expenses
        $todayExpenses = Expense::whereDate('expense_date', now()->toDateString())
                               ->sum('amount');

        // Calculate average daily expense (based on date range)
        $dateRange = null;
        if ($startDate && $endDate) {
            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);
            $days = $start->diffInDays($end) + 1;
            $averageDaily = $days > 0 ? $totalExpenses / $days : 0;
        } else {
            // Default to current month
            $days = now()->daysInMonth;
            $averageDaily = $days > 0 ? $totalExpenses / $days : 0;
        }

        $summary = [
            'totalExpenses' => $totalExpenses,
            'totalExpensesCount' => $totalCount,
            'thisMonthExpenses' => (float) $thisMonthExpenses,
            'todayExpenses' => (float) $todayExpenses,
            'averageDailyExpense' => (float) $averageDaily,
        ];

        // Transform expenses to resource
        $expensesData = ExpenseResource::collection($expenses)->toArray($request);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'expenses' => $expensesData,
            ],
        ], 200);
    }
}

