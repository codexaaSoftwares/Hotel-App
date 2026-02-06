<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Resources\BillResource;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\SalaryPaymentResource;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\SalaryPayment;
use App\Models\Staff;
use App\Models\WalletTransaction;
use App\Models\Setting;
use App\Services\PdfExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
                $query->where('payment_method', $paymentMethod);
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

    /**
     * Get Customer Pending (Udhar) Report
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function customerPendingReport(Request $request)
    {
        $query = Customer::query();

        // Customer filter
        if ($customerId = $request->input('customer_id')) {
            if ($customerId !== 'all') {
                $query->where('id', $customerId);
            }
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Get all customers
        $customers = $query->get();

        // Get date range filters
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Calculate wallet balances for each customer by querying wallet transactions directly
        // This ensures we get all transactions, not just eager-loaded ones
        $customersWithBalance = $customers->map(function ($customer) use ($startDate, $endDate) {
            // Build query for credits
            $creditsQuery = WalletTransaction::where('customer_id', $customer->id)
                ->where('transaction_type', 'credit');
            
            // Build query for debits
            $debitsQuery = WalletTransaction::where('customer_id', $customer->id)
                ->where('transaction_type', 'debit');
            
            // Apply date range filter if provided
            if ($startDate) {
                $creditsQuery->whereDate('transaction_date', '>=', $startDate);
                $debitsQuery->whereDate('transaction_date', '>=', $startDate);
            }
            
            if ($endDate) {
                $creditsQuery->whereDate('transaction_date', '<=', $endDate);
                $debitsQuery->whereDate('transaction_date', '<=', $endDate);
            }
            
            $totalCredits = (float) $creditsQuery->sum('amount');
            $totalDebits = (float) $debitsQuery->sum('amount');
            
            // Remaining = Credits - Debits (positive means customer has credit/pending)
            $remainingBalance = $totalCredits - $totalDebits;

            // Get last transaction date (with date filter if provided)
            $lastTransactionQuery = WalletTransaction::where('customer_id', $customer->id);
            
            if ($startDate) {
                $lastTransactionQuery->whereDate('transaction_date', '>=', $startDate);
            }
            
            if ($endDate) {
                $lastTransactionQuery->whereDate('transaction_date', '<=', $endDate);
            }
            
            $lastTransaction = $lastTransactionQuery->orderBy('created_at', 'desc')->first();

            return [
                'id' => $customer->id,
                'customerCode' => $customer->customer_code,
                'name' => $customer->name,
                'mobile' => $customer->mobile,
                'email' => $customer->email,
                'customerType' => $customer->customer_type,
                'status' => $customer->status,
                'totalCredits' => $totalCredits,
                'totalDebits' => $totalDebits,
                'remainingBalance' => $remainingBalance,
                'lastTransactionDate' => $lastTransaction ? $lastTransaction->created_at : null,
            ];
        });

        // Filter customers with pending (remaining balance < 0 means they owe money)
        // Pending/Udhar = customers who owe money (debits > credits)
        $customersWithPending = $customersWithBalance->filter(function ($customer) {
            return $customer['remainingBalance'] < 0;
        });

        // Calculate summary statistics
        // Use absolute value since remainingBalance is negative for pending amounts
        $totalPendingAmount = (float) $customersWithPending->sum(function ($customer) {
            return abs($customer['remainingBalance']);
        });
        $totalCustomersWithPending = $customersWithPending->count();
        $averagePendingPerCustomer = $totalCustomersWithPending > 0 
            ? $totalPendingAmount / $totalCustomersWithPending 
            : 0;

        $summary = [
            'totalPendingAmount' => $totalPendingAmount,
            'totalCustomersWithPending' => $totalCustomersWithPending,
            'averagePendingPerCustomer' => (float) $averagePendingPerCustomer,
        ];

        // Return all customers (not just those with pending) for the table
        // Frontend can filter if needed
        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'customers' => $customersWithBalance->values()->all(),
            ],
        ], 200);
    }

    /**
     * Get Staff & Salary Report
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function staffSalaryReport(Request $request)
    {
        $query = SalaryPayment::with(['staff', 'creator']);

        // Staff filter
        if ($staffId = $request->input('staff_id')) {
            if ($staffId !== 'all' && $staffId !== '') {
                $query->where('staff_id', $staffId);
            }
        }

        // Department filter (through staff relationship)
        if ($department = $request->input('department')) {
            if ($department !== 'all' && $department !== '') {
                $query->whereHas('staff', function ($q) use ($department) {
                    $q->where('department', $department);
                });
            }
        }

        // Month filter
        if ($month = $request->input('month')) {
            if ($month !== 'all' && $month !== '') {
                $query->where('month', $month);
            }
        }

        // Year filter
        if ($year = $request->input('year')) {
            if ($year !== 'all' && $year !== '') {
                $query->where('year', $year);
            }
        }

        // Get all salary payments (no pagination for reports)
        $salaryPayments = $query->orderBy('payment_date', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->get();

        // Calculate summary statistics
        $totalSalaryPaid = (float) $salaryPayments->sum('paid_amount');
        $totalPaymentsCount = $salaryPayments->count();
        
        // Get unique staff count
        $uniqueStaffIds = $salaryPayments->pluck('staff_id')->unique();
        $totalStaffCount = $uniqueStaffIds->count();
        
        // Calculate average salary per staff
        $averageSalaryPerStaff = $totalStaffCount > 0 
            ? $totalSalaryPaid / $totalStaffCount 
            : 0;

        $summary = [
            'totalSalaryPaid' => $totalSalaryPaid,
            'totalStaffCount' => $totalStaffCount,
            'totalPaymentsCount' => $totalPaymentsCount,
            'averageSalaryPerStaff' => (float) $averageSalaryPerStaff,
        ];

        // Transform salary payments to resource
        $salaryPaymentsData = SalaryPaymentResource::collection($salaryPayments)->toArray($request);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'salaryPayments' => $salaryPaymentsData,
            ],
        ], 200);
    }

    /**
     * Get Category-wise Item Sales Report
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function categoryWiseItemReport(Request $request)
    {
        // Build query for bill items with relationships
        $query = BillItem::with(['foodItem.foodCategory', 'bill'])
            ->whereHas('bill', function ($q) {
                // Only include paid bills for accurate sales data
                $q->where('payment_status', 'paid');
            });

        // Date range filter (required for reports)
        if ($startDate = $request->input('start_date')) {
            $query->whereHas('bill', function ($q) use ($startDate) {
                $q->whereDate('bill_date', '>=', $startDate);
            });
        } else {
            // Default to current month if no date provided
            $query->whereHas('bill', function ($q) {
                $q->whereMonth('bill_date', now()->month)
                  ->whereYear('bill_date', now()->year);
            });
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereHas('bill', function ($q) use ($endDate) {
                $q->whereDate('bill_date', '<=', $endDate);
            });
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            if ($categoryId !== 'all' && $categoryId !== '') {
                $query->whereHas('foodItem', function ($q) use ($categoryId) {
                    $q->where('food_category_id', $categoryId);
                });
            }
        }

        // Item status filter
        if ($itemStatus = $request->input('item_status')) {
            if ($itemStatus !== 'all' && $itemStatus !== '') {
                $query->whereHas('foodItem', function ($q) use ($itemStatus) {
                    $q->where('status', $itemStatus);
                });
            }
        }

        // Get all bill items
        $billItems = $query->get();

        // Group by category and item, then aggregate
        $categoryData = [];
        $totalItemsSold = 0;
        $totalRevenue = 0;
        $allBillIds = [];
        $topCategory = null;
        $topItem = null;
        $maxCategoryRevenue = 0;
        $maxItemRevenue = 0;

        foreach ($billItems as $billItem) {
            if (!$billItem->foodItem || !$billItem->foodItem->foodCategory) {
                continue; // Skip if food item or category is missing
            }

            $category = $billItem->foodItem->foodCategory;
            $item = $billItem->foodItem;
            $categoryId = $category->id;
            $itemId = $item->id;
            $billId = $billItem->bill_id;

            // Track all bill IDs
            $allBillIds[] = $billId;

            // Initialize category if not exists
            if (!isset($categoryData[$categoryId])) {
                $categoryData[$categoryId] = [
                    'categoryId' => $category->id,
                    'categoryName' => $category->name,
                    'totalItemsSold' => 0,
                    'totalRevenue' => 0,
                    'billIds' => [],
                    'items' => [],
                ];
            }

            // Track unique bills per category
            if (!in_array($billId, $categoryData[$categoryId]['billIds'])) {
                $categoryData[$categoryId]['billIds'][] = $billId;
            }

            // Initialize item if not exists
            if (!isset($categoryData[$categoryId]['items'][$itemId])) {
                $categoryData[$categoryId]['items'][$itemId] = [
                    'itemId' => $item->id,
                    'itemName' => $item->name,
                    'itemPrice' => (float) $item->price,
                    'quantitySold' => 0,
                    'revenue' => 0,
                    'billIds' => [],
                ];
            }

            // Track unique bills per item
            if (!in_array($billId, $categoryData[$categoryId]['items'][$itemId]['billIds'])) {
                $categoryData[$categoryId]['items'][$itemId]['billIds'][] = $billId;
            }

            // Aggregate data
            $quantity = (int) $billItem->quantity;
            $revenue = (float) $billItem->total_price;

            $categoryData[$categoryId]['items'][$itemId]['quantitySold'] += $quantity;
            $categoryData[$categoryId]['items'][$itemId]['revenue'] += $revenue;

            $categoryData[$categoryId]['totalItemsSold'] += $quantity;
            $categoryData[$categoryId]['totalRevenue'] += $revenue;

            $totalItemsSold += $quantity;
            $totalRevenue += $revenue;

            // Track top item
            if ($categoryData[$categoryId]['items'][$itemId]['revenue'] > $maxItemRevenue) {
                $maxItemRevenue = $categoryData[$categoryId]['items'][$itemId]['revenue'];
                $topItem = [
                    'itemName' => $item->name,
                    'categoryName' => $category->name,
                    'revenue' => $categoryData[$categoryId]['items'][$itemId]['revenue'],
                    'quantitySold' => $categoryData[$categoryId]['items'][$itemId]['quantitySold'],
                ];
            }
        }

        // Get unique bills count
        $uniqueBills = array_unique($allBillIds);
        $totalBillsCount = count($uniqueBills);

        // Find top category
        foreach ($categoryData as $cat) {
            if ($cat['totalRevenue'] > $maxCategoryRevenue) {
                $maxCategoryRevenue = $cat['totalRevenue'];
                $topCategory = [
                    'categoryName' => $cat['categoryName'],
                    'revenue' => $cat['totalRevenue'],
                    'itemsSold' => $cat['totalItemsSold'],
                ];
            }
        }

        // Flatten the data into a simple list of items with category info
        $itemsList = [];
        foreach ($categoryData as $category) {
            $categoryName = $category['categoryName'];
            $categoryId = $category['categoryId'];
            
            foreach ($category['items'] as $item) {
                $itemsList[] = [
                    'categoryId' => $categoryId,
                    'categoryName' => $categoryName,
                    'itemId' => $item['itemId'],
                    'itemName' => $item['itemName'],
                    'itemPrice' => $item['itemPrice'],
                    'quantitySold' => $item['quantitySold'],
                    'revenue' => $item['revenue'],
                    'billsCount' => count($item['billIds']),
                    'avgPrice' => $item['quantitySold'] > 0 
                        ? $item['revenue'] / $item['quantitySold'] 
                        : 0,
                ];
            }
        }

        // Sort by quantity sold (descending)
        usort($itemsList, function ($a, $b) {
            return $b['quantitySold'] <=> $a['quantitySold'];
        });

        // Calculate average items per bill
        $averageItemsPerBill = $totalBillsCount > 0 ? $totalItemsSold / $totalBillsCount : 0;

        $summary = [
            'totalItemsSold' => $totalItemsSold,
            'totalRevenue' => (float) $totalRevenue,
            'totalBillsCount' => $totalBillsCount,
            'averageItemsPerBill' => (float) $averageItemsPerBill,
            'topCategory' => $topCategory,
            'topItem' => $topItem,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'items' => $itemsList,
            ],
        ], 200);
    }

    /**
     * Export Sales Report as PDF
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportSalesReportPdf(Request $request)
    {
        // Get report data (reuse salesReport logic)
        $query = Bill::with(['table', 'customer', 'creator', 'billItems.foodItem']);

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('bill_date', '>=', $startDate);
        } else {
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
                $query->where('payment_method', $paymentMethod);
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

        $bills = $query->orderBy('bill_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->get();

        // Calculate summary
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

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Format date range
        $startDateFormatted = $startDate ? Carbon::parse($startDate)->format('d M Y') : Carbon::now()->startOfMonth()->format('d M Y');
        $endDateFormatted = $endDate ? Carbon::parse($endDate)->format('d M Y') : Carbon::now()->endOfMonth()->format('d M Y');
        $reportPeriod = $startDateFormatted . ' to ' . $endDateFormatted;

        // Prepare summary in compact grid format
        $summaryRows = [
            ['Total Sales', '₹' . number_format($summary['totalSalesAmount'], 2)],
            ['Total Bills', $summary['totalBillsCount']],
            ['Paid Bills', $summary['paidBillsCount']],
            ['Pending Bills', $summary['pendingBillsCount']],
            ['Total Subtotal', '₹' . number_format($summary['totalSubtotal'], 2)],
            ['Total Discount', '₹' . number_format($summary['totalDiscount'], 2)],
            ['Total CGST', '₹' . number_format($summary['totalCgstAmount'], 2)],
            ['Total SGST', '₹' . number_format($summary['totalSgstAmount'], 2)],
            ['Total Service Tax', '₹' . number_format($summary['totalServiceTaxAmount'], 2)],
        ];

        // Prepare table data with compact formatting
        $tableData = [];
        foreach ($bills as $bill) {
            $tableData[] = [
                $bill->bill_number ?? '#BILL' . $bill->id,
                Carbon::parse($bill->bill_date)->format('d/m/Y'),
                $bill->table ? $bill->table->table_name : '-',
                $bill->customer ? substr($bill->customer->name, 0, 15) : 'Walk-in',
                ucfirst($bill->payment_method ?? '-'),
                ucfirst($bill->payment_status),
                '₹' . number_format($bill->subtotal, 2),
                '₹' . number_format($bill->discount, 2),
                '₹' . number_format($bill->cgst_amount, 2),
                '₹' . number_format($bill->sgst_amount, 2),
                '₹' . number_format($bill->service_tax_amount, 2),
                '₹' . number_format($bill->total_amount, 2),
            ];
        }

        // Prepare sections
        $sections = [
            [
                'title' => 'Summary',
                'summaryRows' => $summaryRows,
            ],
            [
                'title' => 'Bill Details',
                'columns' => ['Bill #', 'Date', 'Table', 'Customer', 'Pay Method', 'Status', 'Subtotal', 'Discount', 'CGST', 'SGST', 'Svc Tax', 'Total'],
                'data' => $tableData,
                'rightAlignColumns' => [6, 7, 8, 9, 10, 11], // Indices for right-aligned columns (amounts)
            ],
        ];

        $pdfService = new PdfExportService();
        $filename = 'sales_report_' . ($startDate ?? 'all') . '_' . ($endDate ?? 'all') . '.pdf';

        return $pdfService->export('pdfs.sales_report', [
            'businessName' => $businessName,
            'businessAddress' => $businessAddress,
            'businessPhone' => $businessPhone,
            'businessEmail' => $businessEmail,
            'gstNumber' => $gstNumber,
            'generatedDate' => Carbon::now()->format('d M Y H:i:s'),
            'reportPeriod' => $reportPeriod,
            'reportSubtitle' => '(Restaurant)',
            'sections' => $sections,
        ], $filename);
    }

    /**
     * Export Expense Report as PDF
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportExpenseReportPdf(Request $request)
    {
        // Get report data (reuse expenseReport logic)
        $query = Expense::with(['category', 'creator']);

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('expense_date', '>=', $startDate);
        } else {
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

        $expenses = $query->orderBy('expense_date', 'desc')
                         ->orderBy('created_at', 'desc')
                         ->get();

        // Calculate summary
        $totalExpenses = (float) $expenses->sum('amount');
        $totalCount = $expenses->count();
        
        $thisMonthExpenses = Expense::whereMonth('expense_date', now()->month)
                                   ->whereYear('expense_date', now()->year)
                                   ->sum('amount');
        
        $todayExpenses = Expense::whereDate('expense_date', now()->toDateString())
                               ->sum('amount');

        $dateRange = null;
        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
            $days = $start->diffInDays($end) + 1;
            $averageDaily = $days > 0 ? $totalExpenses / $days : 0;
        } else {
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

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Format date range
        $startDateFormatted = $startDate ? Carbon::parse($startDate)->format('d M Y') : Carbon::now()->startOfMonth()->format('d M Y');
        $endDateFormatted = $endDate ? Carbon::parse($endDate)->format('d M Y') : Carbon::now()->endOfMonth()->format('d M Y');
        $reportPeriod = $startDateFormatted . ' to ' . $endDateFormatted;

        // Prepare summary rows
        $summaryRows = [
            ['Total Expenses', '₹' . number_format($summary['totalExpenses'], 2)],
            ['Total Records', $summary['totalExpensesCount']],
            ['This Month Expenses', '₹' . number_format($summary['thisMonthExpenses'], 2)],
            ['Today Expenses', '₹' . number_format($summary['todayExpenses'], 2)],
            ['Average Daily Expense', '₹' . number_format($summary['averageDailyExpense'], 2)],
        ];

        // Prepare table data with compact formatting
        $tableData = [];
        foreach ($expenses as $expense) {
            $tableData[] = [
                Carbon::parse($expense->expense_date)->format('d/m/Y'),
                $expense->category ? substr($expense->category->name, 0, 20) : '-',
                $expense->description ? substr($expense->description, 0, 30) : '-',
                '₹' . number_format($expense->amount, 2),
                ucfirst($expense->payment_method ?? '-'),
                $expense->creator ? substr($expense->creator->first_name . ' ' . $expense->creator->last_name, 0, 20) : '-',
            ];
        }

        // Prepare sections
        $sections = [
            [
                'title' => 'Summary',
                'summaryRows' => $summaryRows,
            ],
            [
                'title' => 'Expense Details',
                'columns' => ['Date', 'Category', 'Description', 'Amount', 'Pay Method', 'Created By'],
                'data' => $tableData,
                'rightAlignColumns' => [3], // Amount column
            ],
        ];

        $pdfService = new PdfExportService();
        $filename = 'expense_report_' . ($startDate ?? 'all') . '_' . ($endDate ?? 'all') . '.pdf';

        return $pdfService->export('pdfs.expense_report', [
            'businessName' => $businessName,
            'businessAddress' => $businessAddress,
            'businessPhone' => $businessPhone,
            'businessEmail' => $businessEmail,
            'gstNumber' => $gstNumber,
            'generatedDate' => Carbon::now()->format('d M Y H:i:s'),
            'reportPeriod' => $reportPeriod,
            'sections' => $sections,
        ], $filename);
    }

    /**
     * Export Customer Pending Report as PDF
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportCustomerPendingReportPdf(Request $request)
    {
        // Get report data (reuse customerPendingReport logic)
        $query = Customer::query();

        // Customer filter
        if ($customerId = $request->input('customer_id')) {
            if ($customerId !== 'all') {
                $query->where('id', $customerId);
            }
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $customers = $query->get();

        // Get date range filters
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Calculate wallet balances
        $customersWithBalance = $customers->map(function ($customer) use ($startDate, $endDate) {
            $creditsQuery = WalletTransaction::where('customer_id', $customer->id)
                ->where('transaction_type', 'credit');
            
            $debitsQuery = WalletTransaction::where('customer_id', $customer->id)
                ->where('transaction_type', 'debit');
            
            if ($startDate) {
                $creditsQuery->whereDate('transaction_date', '>=', $startDate);
                $debitsQuery->whereDate('transaction_date', '>=', $startDate);
            }
            
            if ($endDate) {
                $creditsQuery->whereDate('transaction_date', '<=', $endDate);
                $debitsQuery->whereDate('transaction_date', '<=', $endDate);
            }
            
            $totalCredits = (float) $creditsQuery->sum('amount');
            $totalDebits = (float) $debitsQuery->sum('amount');
            $remainingBalance = $totalCredits - $totalDebits;

            $lastTransactionQuery = WalletTransaction::where('customer_id', $customer->id);
            
            if ($startDate) {
                $lastTransactionQuery->whereDate('transaction_date', '>=', $startDate);
            }
            
            if ($endDate) {
                $lastTransactionQuery->whereDate('transaction_date', '<=', $endDate);
            }
            
            $lastTransaction = $lastTransactionQuery->orderBy('created_at', 'desc')->first();

            return [
                'id' => $customer->id,
                'customerCode' => $customer->customer_code,
                'name' => $customer->name,
                'mobile' => $customer->mobile,
                'email' => $customer->email,
                'customerType' => $customer->customer_type,
                'status' => $customer->status,
                'totalCredits' => $totalCredits,
                'totalDebits' => $totalDebits,
                'remainingBalance' => $remainingBalance,
                'lastTransactionDate' => $lastTransaction ? $lastTransaction->created_at : null,
            ];
        });

        // Filter customers with pending
        $customersWithPending = $customersWithBalance->filter(function ($customer) {
            return $customer['remainingBalance'] < 0;
        });

        // Calculate summary
        $totalPendingAmount = (float) $customersWithPending->sum(function ($customer) {
            return abs($customer['remainingBalance']);
        });
        $totalCustomersWithPending = $customersWithPending->count();
        $averagePendingPerCustomer = $totalCustomersWithPending > 0 
            ? $totalPendingAmount / $totalCustomersWithPending 
            : 0;

        $summary = [
            'totalPendingAmount' => $totalPendingAmount,
            'totalCustomersWithPending' => $totalCustomersWithPending,
            'averagePendingPerCustomer' => (float) $averagePendingPerCustomer,
        ];

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Format date range
        $reportPeriod = 'All Time';
        if ($startDate || $endDate) {
            $startDateFormatted = $startDate ? Carbon::parse($startDate)->format('d M Y') : 'Beginning';
            $endDateFormatted = $endDate ? Carbon::parse($endDate)->format('d M Y') : 'Today';
            $reportPeriod = $startDateFormatted . ' to ' . $endDateFormatted;
        }

        // Prepare summary rows
        $summaryRows = [
            ['Total Pending Amount', '₹' . number_format($summary['totalPendingAmount'], 2)],
            ['Total Customers with Pending', $summary['totalCustomersWithPending']],
            ['Average Pending per Customer', '₹' . number_format($summary['averagePendingPerCustomer'], 2)],
        ];

        // Prepare table data (only customers with pending)
        $tableData = [];
        foreach ($customersWithPending as $customer) {
            $tableData[] = [
                $customer['customerCode'],
                substr($customer['name'], 0, 20),
                $customer['mobile'] ?? '-',
                '₹' . number_format($customer['totalCredits'], 2),
                '₹' . number_format($customer['totalDebits'], 2),
                '₹' . number_format(abs($customer['remainingBalance']), 2),
                $customer['lastTransactionDate'] ? Carbon::parse($customer['lastTransactionDate'])->format('d/m/Y') : '-',
                ucfirst($customer['status']),
            ];
        }

        // Prepare sections
        $sections = [
            [
                'title' => 'Summary',
                'summaryRows' => $summaryRows,
            ],
            [
                'title' => 'Customer Pending Details',
                'columns' => ['Cust Code', 'Name', 'Mobile', 'Credit', 'Debit', 'Pending', 'Last Trans', 'Status'],
                'data' => $tableData,
                'rightAlignColumns' => [3, 4, 5], // Credit, Debit, Pending columns
            ],
        ];

        $pdfService = new PdfExportService();
        $filename = 'customer_pending_report_' . ($startDate ?? 'all') . '_' . ($endDate ?? 'all') . '.pdf';

        return $pdfService->export('pdfs.customer_pending_report', [
            'businessName' => $businessName,
            'businessAddress' => $businessAddress,
            'businessPhone' => $businessPhone,
            'businessEmail' => $businessEmail,
            'gstNumber' => $gstNumber,
            'generatedDate' => Carbon::now()->format('d M Y H:i:s'),
            'reportPeriod' => $reportPeriod,
            'reportSubtitle' => '(Restaurant)',
            'sections' => $sections,
        ], $filename);
    }

    /**
     * Export Staff & Salary Report as PDF
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportStaffSalaryReportPdf(Request $request)
    {
        // Get report data (reuse staffSalaryReport logic)
        $query = SalaryPayment::with(['staff', 'creator']);

        // Staff filter
        if ($staffId = $request->input('staff_id')) {
            if ($staffId !== 'all' && $staffId !== '') {
                $query->where('staff_id', $staffId);
            }
        }

        // Department filter
        if ($department = $request->input('department')) {
            if ($department !== 'all' && $department !== '') {
                $query->whereHas('staff', function ($q) use ($department) {
                    $q->where('department', $department);
                });
            }
        }

        // Month filter
        if ($month = $request->input('month')) {
            if ($month !== 'all' && $month !== '') {
                $query->where('month', $month);
            }
        }

        // Year filter
        if ($year = $request->input('year')) {
            if ($year !== 'all' && $year !== '') {
                $query->where('year', $year);
            }
        }

        $salaryPayments = $query->orderBy('payment_date', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->get();

        // Calculate summary
        $totalSalaryPaid = (float) $salaryPayments->sum('paid_amount');
        $totalPaymentsCount = $salaryPayments->count();
        
        $uniqueStaffIds = $salaryPayments->pluck('staff_id')->unique();
        $totalStaffCount = $uniqueStaffIds->count();
        
        $averageSalaryPerStaff = $totalStaffCount > 0 
            ? $totalSalaryPaid / $totalStaffCount 
            : 0;

        $summary = [
            'totalSalaryPaid' => $totalSalaryPaid,
            'totalStaffCount' => $totalStaffCount,
            'totalPaymentsCount' => $totalPaymentsCount,
            'averageSalaryPerStaff' => (float) $averageSalaryPerStaff,
        ];

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Format period
        $month = $request->input('month');
        $year = $request->input('year');
        $reportPeriod = 'All Time';
        if ($month && $month !== 'all') {
            $monthName = Carbon::create()->month($month)->format('F');
            $reportPeriod = $monthName . ($year && $year !== 'all' ? ' ' . $year : '');
        } elseif ($year && $year !== 'all') {
            $reportPeriod = 'Year ' . $year;
        }

        // Prepare summary rows
        $summaryRows = [
            ['Total Salary Paid', '₹' . number_format($summary['totalSalaryPaid'], 2)],
            ['Total Staff Count', $summary['totalStaffCount']],
            ['Total Payments Count', $summary['totalPaymentsCount']],
            ['Average Salary per Staff', '₹' . number_format($summary['averageSalaryPerStaff'], 2)],
        ];

        // Prepare table data with compact formatting
        $tableData = [];
        foreach ($salaryPayments as $payment) {
            $tableData[] = [
                Carbon::parse($payment->payment_date)->format('d/m/Y'),
                'STF' . $payment->staff_id,
                $payment->staff ? substr($payment->staff->name, 0, 20) : '-',
                $payment->staff ? substr($payment->staff->department, 0, 15) : '-',
                Carbon::create()->month($payment->month)->format('M') . ' ' . $payment->year,
                '₹' . number_format($payment->paid_amount, 2),
                ucfirst($payment->payment_method ?? '-'),
                $payment->notes ? substr($payment->notes, 0, 20) : '-',
                $payment->creator ? substr($payment->creator->first_name . ' ' . $payment->creator->last_name, 0, 20) : '-',
            ];
        }

        // Prepare sections
        $sections = [
            [
                'title' => 'Summary',
                'summaryRows' => $summaryRows,
            ],
            [
                'title' => 'Salary Payment Details',
                'columns' => ['Date', 'Code', 'Staff Name', 'Dept', 'Month/Year', 'Amount', 'Method', 'Notes', 'Created By'],
                'data' => $tableData,
                'rightAlignColumns' => [5], // Amount column
            ],
        ];

        $pdfService = new PdfExportService();
        $filename = 'staff_salary_report_' . ($month ?? 'all') . '_' . ($year ?? 'all') . '.pdf';

        return $pdfService->export('pdfs.staff_salary_report', [
            'businessName' => $businessName,
            'businessAddress' => $businessAddress,
            'businessPhone' => $businessPhone,
            'businessEmail' => $businessEmail,
            'gstNumber' => $gstNumber,
            'generatedDate' => Carbon::now()->format('d M Y H:i:s'),
            'reportPeriod' => $reportPeriod,
            'sections' => $sections,
        ], $filename);
    }

    /**
     * Export Category-wise Item Sales Report as PDF
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportCategoryWiseItemReportPdf(Request $request)
    {
        // Get report data (reuse categoryWiseItemReport logic)
        $query = BillItem::with(['foodItem.foodCategory', 'bill'])
            ->whereHas('bill', function ($q) {
                $q->where('payment_status', 'paid');
            });

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->whereHas('bill', function ($q) use ($startDate) {
                $q->whereDate('bill_date', '>=', $startDate);
            });
        } else {
            $query->whereHas('bill', function ($q) {
                $q->whereMonth('bill_date', now()->month)
                  ->whereYear('bill_date', now()->year);
            });
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereHas('bill', function ($q) use ($endDate) {
                $q->whereDate('bill_date', '<=', $endDate);
            });
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            if ($categoryId !== 'all' && $categoryId !== '') {
                $query->whereHas('foodItem', function ($q) use ($categoryId) {
                    $q->where('food_category_id', $categoryId);
                });
            }
        }

        // Item status filter
        if ($itemStatus = $request->input('item_status')) {
            if ($itemStatus !== 'all' && $itemStatus !== '') {
                $query->whereHas('foodItem', function ($q) use ($itemStatus) {
                    $q->where('status', $itemStatus);
                });
            }
        }

        $billItems = $query->get();

        // Group and aggregate data
        $categoryData = [];
        $totalItemsSold = 0;
        $totalRevenue = 0;
        $allBillIds = [];
        $topCategory = null;
        $topItem = null;
        $maxCategoryRevenue = 0;
        $maxItemRevenue = 0;

        foreach ($billItems as $billItem) {
            if (!$billItem->foodItem || !$billItem->foodItem->foodCategory) {
                continue;
            }

            $category = $billItem->foodItem->foodCategory;
            $item = $billItem->foodItem;
            $categoryId = $category->id;
            $itemId = $item->id;
            $billId = $billItem->bill_id;

            $allBillIds[] = $billId;

            if (!isset($categoryData[$categoryId])) {
                $categoryData[$categoryId] = [
                    'categoryId' => $category->id,
                    'categoryName' => $category->name,
                    'totalItemsSold' => 0,
                    'totalRevenue' => 0,
                    'billIds' => [],
                    'items' => [],
                ];
            }

            if (!in_array($billId, $categoryData[$categoryId]['billIds'])) {
                $categoryData[$categoryId]['billIds'][] = $billId;
            }

            if (!isset($categoryData[$categoryId]['items'][$itemId])) {
                $categoryData[$categoryId]['items'][$itemId] = [
                    'itemId' => $item->id,
                    'itemName' => $item->name,
                    'itemPrice' => (float) $item->price,
                    'quantitySold' => 0,
                    'revenue' => 0,
                    'billIds' => [],
                ];
            }

            if (!in_array($billId, $categoryData[$categoryId]['items'][$itemId]['billIds'])) {
                $categoryData[$categoryId]['items'][$itemId]['billIds'][] = $billId;
            }

            $quantity = (int) $billItem->quantity;
            $revenue = (float) $billItem->total_price;

            $categoryData[$categoryId]['items'][$itemId]['quantitySold'] += $quantity;
            $categoryData[$categoryId]['items'][$itemId]['revenue'] += $revenue;

            $categoryData[$categoryId]['totalItemsSold'] += $quantity;
            $categoryData[$categoryId]['totalRevenue'] += $revenue;

            $totalItemsSold += $quantity;
            $totalRevenue += $revenue;

            if ($categoryData[$categoryId]['items'][$itemId]['revenue'] > $maxItemRevenue) {
                $maxItemRevenue = $categoryData[$categoryId]['items'][$itemId]['revenue'];
                $topItem = [
                    'itemName' => $item->name,
                    'categoryName' => $category->name,
                    'revenue' => $categoryData[$categoryId]['items'][$itemId]['revenue'],
                    'quantitySold' => $categoryData[$categoryId]['items'][$itemId]['quantitySold'],
                ];
            }
        }

        $uniqueBills = array_unique($allBillIds);
        $totalBillsCount = count($uniqueBills);

        foreach ($categoryData as $cat) {
            if ($cat['totalRevenue'] > $maxCategoryRevenue) {
                $maxCategoryRevenue = $cat['totalRevenue'];
                $topCategory = [
                    'categoryName' => $cat['categoryName'],
                    'revenue' => $cat['totalRevenue'],
                    'itemsSold' => $cat['totalItemsSold'],
                ];
            }
        }

        // Flatten the data
        $itemsList = [];
        foreach ($categoryData as $category) {
            $categoryName = $category['categoryName'];
            $categoryId = $category['categoryId'];
            
            foreach ($category['items'] as $item) {
                $itemsList[] = [
                    'categoryId' => $categoryId,
                    'categoryName' => $categoryName,
                    'itemId' => $item['itemId'],
                    'itemName' => $item['itemName'],
                    'itemPrice' => $item['itemPrice'],
                    'quantitySold' => $item['quantitySold'],
                    'revenue' => $item['revenue'],
                    'billsCount' => count($item['billIds']),
                    'avgPrice' => $item['quantitySold'] > 0 
                        ? $item['revenue'] / $item['quantitySold'] 
                        : 0,
                ];
            }
        }

        // Sort by quantity sold (descending)
        usort($itemsList, function ($a, $b) {
            return $b['quantitySold'] <=> $a['quantitySold'];
        });

        $averageItemsPerBill = $totalBillsCount > 0 ? $totalItemsSold / $totalBillsCount : 0;

        $summary = [
            'totalItemsSold' => $totalItemsSold,
            'totalRevenue' => (float) $totalRevenue,
            'totalBillsCount' => $totalBillsCount,
            'averageItemsPerBill' => (float) $averageItemsPerBill,
            'topCategory' => $topCategory,
            'topItem' => $topItem,
        ];

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Format date range
        $startDateFormatted = $startDate ? Carbon::parse($startDate)->format('d M Y') : Carbon::now()->startOfMonth()->format('d M Y');
        $endDateFormatted = $endDate ? Carbon::parse($endDate)->format('d M Y') : Carbon::now()->endOfMonth()->format('d M Y');
        $reportPeriod = $startDateFormatted . ' to ' . $endDateFormatted;

        // Prepare summary rows
        $topCategoryText = $topCategory ? $topCategory['categoryName'] . ' (₹' . number_format($topCategory['revenue'], 2) . ')' : 'N/A';
        $topItemText = $topItem ? substr($topItem['itemName'], 0, 25) . ' (₹' . number_format($topItem['revenue'], 2) . ')' : 'N/A';
        
        $summaryRows = [
            ['Total Items Sold', number_format($summary['totalItemsSold'])],
            ['Total Revenue', '₹' . number_format($summary['totalRevenue'], 2)],
            ['Total Bills Count', $summary['totalBillsCount']],
            ['Average Items per Bill', number_format($summary['averageItemsPerBill'], 2)],
            ['Top Category', $topCategoryText],
            ['Top Item', $topItemText],
        ];

        // Prepare table data with compact formatting
        $tableData = [];
        foreach ($itemsList as $item) {
            $tableData[] = [
                substr($item['categoryName'], 0, 15),
                substr($item['itemName'], 0, 25),
                '₹' . number_format($item['itemPrice'], 2),
                $item['quantitySold'],
                '₹' . number_format($item['revenue'], 2),
                $item['billsCount'],
                '₹' . number_format($item['avgPrice'], 2),
            ];
        }

        // Prepare sections
        $sections = [
            [
                'title' => 'Summary',
                'summaryRows' => $summaryRows,
            ],
            [
                'title' => 'Item Sales Details',
                'columns' => ['Category', 'Item Name', 'Price', 'Qty Sold', 'Revenue', 'Bills', 'Avg Price'],
                'data' => $tableData,
                'rightAlignColumns' => [2, 3, 4, 6], // Price, Qty, Revenue, Avg Price columns
            ],
        ];

        $pdfService = new PdfExportService();
        $filename = 'category_wise_item_report_' . ($startDate ?? 'all') . '_' . ($endDate ?? 'all') . '.pdf';

        return $pdfService->export('pdfs.category_wise_item_report', [
            'businessName' => $businessName,
            'businessAddress' => $businessAddress,
            'businessPhone' => $businessPhone,
            'businessEmail' => $businessEmail,
            'gstNumber' => $gstNumber,
            'generatedDate' => Carbon::now()->format('d M Y H:i:s'),
            'reportPeriod' => $reportPeriod,
            'reportSubtitle' => '(Restaurant)',
            'sections' => $sections,
        ], $filename);
    }
}

