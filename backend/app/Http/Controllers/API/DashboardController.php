<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\Order;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard summary cards data.
     */
    public function summary(Request $request)
    {
        [$startDate, $endDate, $previousStart, $previousEnd] = $this->resolveDateRanges($request);

        $currentRevenue = $this->getNetRevenue($startDate, $endDate);
        $previousRevenue = $this->getNetRevenue($previousStart, $previousEnd);

        $currentOrders = Order::whereBetween('order_date', [$startDate, $endDate])->count();
        $previousOrders = Order::whereBetween('order_date', [$previousStart, $previousEnd])->count();

        $currentCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();
        $previousCustomers = Customer::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $overallRevenue = $this->getNetRevenue(Carbon::minValue(), now());
        $overallOrders = Order::count();
        $overallCustomers = Customer::count();

        return response()->json([
            'success' => true,
            'data' => [
                'dateRange' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                ],
                'totals' => [
                    'revenue' => $currentRevenue,
                    'orders' => $currentOrders,
                    'customers' => $currentCustomers,
                ],
                'overallTotals' => [
                    'revenue' => $overallRevenue,
                    'orders' => $overallOrders,
                    'customers' => $overallCustomers,
                ],
                'changes' => [
                    'revenue' => $this->calculateChange($currentRevenue, $previousRevenue),
                    'orders' => $this->calculateChange($currentOrders, $previousOrders),
                    'customers' => $this->calculateChange($currentCustomers, $previousCustomers),
                ],
            ],
        ]);
    }

    /**
     * Revenue trend grouped by day.
     */
    public function revenueTrend(Request $request)
    {
        $range = (int) ($request->input('range', 30));
        $range = $range > 0 ? $range : 30;

        $endDate = Carbon::parse($request->input('end_date', now()->toDateString()))->endOfDay();
        $startDate = (clone $endDate)->subDays($range - 1)->startOfDay();

        $payments = Payment::selectRaw('DATE(payment_date) as date, SUM(CASE WHEN payment_type = "credit" THEN amount ELSE -amount END) as net_amount')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $trend = [];
        $cursor = (clone $startDate);
        while ($cursor->lte($endDate)) {
            $date = $cursor->toDateString();
            $trend[] = [
                'date' => $date,
                'amount' => (float) ($payments[$date]->net_amount ?? 0),
            ];
            $cursor->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'range' => $range,
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
                'points' => $trend,
            ],
        ]);
    }

    /**
     * Recent activities feed (orders, payments, customers).
     */
    public function recentActivities()
    {
        $orders = Order::selectRaw('id, order_number as reference, customer_id, order_date as occurred_at, "order" as type')
            ->latest('order_date')
            ->limit(5)
            ->get();

        $payments = Payment::selectRaw('id, payment_number as reference, customer_id, payment_date as occurred_at, "payment" as type')
            ->latest('payment_date')
            ->limit(5)
            ->get();

        $customers = Customer::selectRaw('id, customer_code as reference, id as customer_id, created_at as occurred_at, "customer" as type')
            ->latest('created_at')
            ->limit(5)
            ->get();

        $activities = $orders
            ->concat($payments)
            ->concat($customers)
            ->sortByDesc('occurred_at')
            ->take(4)
            ->values()
            ->map(function ($activity) {
                return [
                    'type' => $activity->type,
                    'reference' => $activity->reference,
                    'customer_id' => $activity->customer_id,
                    'occurred_at' => Carbon::parse($activity->occurred_at)->toDateTimeString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * Resolve date ranges and previous period.
     */
    private function resolveDateRanges(Request $request): array
    {
        $endDate = Carbon::parse($request->input('end_date', now()->toDateString()))->endOfDay();
        $startDate = Carbon::parse($request->input('start_date', (clone $endDate)->subDays(89)->toDateString()))->startOfDay();

        if ($startDate->gt($endDate)) {
            [$startDate, $endDate] = [$endDate->copy()->startOfDay(), $startDate->copy()->endOfDay()];
        }

        $rangeDays = max(1, $startDate->diffInDays($endDate) + 1);
        $previousEnd = (clone $startDate)->subDay()->endOfDay();
        $previousStart = (clone $previousEnd)->subDays($rangeDays - 1)->startOfDay();

        return [$startDate, $endDate, $previousStart, $previousEnd];
    }

    /**
     * Calculate percentage change.
     */
    private function calculateChange($current, $previous): array
    {
        $difference = $current - $previous;
        $percent = $previous == 0
            ? ($current > 0 ? 100 : 0)
            : ($difference / $previous) * 100;

        return [
            'direction' => $difference >= 0 ? 'up' : 'down',
            'value' => round($percent, 2),
        ];
    }

    /**
     * Calculate net revenue (credits minus debits) for a period.
     */
    private function getNetRevenue(Carbon $start, Carbon $end): float
    {
        return (float) Payment::whereBetween('payment_date', [$start, $end])
            ->selectRaw('SUM(CASE WHEN payment_type = "credit" THEN amount ELSE -amount END) as net_amount')
            ->value('net_amount') ?? 0;
    }

    /**
     * Orders summary - Status counts.
     */
    public function ordersSummary(Request $request)
    {
        [$startDate, $endDate] = array_slice($this->resolveDateRanges($request), 0, 2);

        $totalOrders = Order::whereBetween('order_date', [$startDate, $endDate])->count();
        $pendingOrders = Order::whereBetween('order_date', [$startDate, $endDate])
            ->where('status', 'pending')
            ->count();
        $processingOrders = Order::whereBetween('order_date', [$startDate, $endDate])
            ->where('status', 'processing')
            ->count();
        $completedOrders = Order::whereBetween('order_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'totalOrders' => $totalOrders,
                'pendingOrders' => $pendingOrders,
                'processingOrders' => $processingOrders,
                'completedOrders' => $completedOrders,
            ],
        ]);
    }

    /**
     * Customers summary - Statistics.
     */
    public function customersSummary(Request $request)
    {
        [$startDate, $endDate] = array_slice($this->resolveDateRanges($request), 0, 2);

        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('status', 'active')->count();
        
        $newCustomersThisMonth = Customer::whereBetween('created_at', [
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth(),
        ])->count();

        // VIP customers: Customers with significant paid amount (top 20% or those with paid amount > threshold)
        // Calculate average paid amount per customer from payments
        $customerPaidAmounts = DB::table('payments')
            ->select('customer_id')
            ->selectRaw('SUM(CASE WHEN payment_type = "credit" THEN amount ELSE -amount END) as net_paid')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->get();

        if ($customerPaidAmounts->isNotEmpty()) {
            $avgPaidAmount = $customerPaidAmounts->avg('net_paid') ?? 0;
            $threshold = $avgPaidAmount * 1.5;
            
            // Count customers with paid amount above threshold
            $vipCustomerIds = $customerPaidAmounts
                ->where('net_paid', '>', $threshold)
                ->pluck('customer_id')
                ->toArray();
            
            $vipCustomers = count($vipCustomerIds);
        } else {
            // If no payments, use customers with multiple orders as VIP
            $vipCustomers = Customer::has('orders', '>=', 2)->count();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'totalCustomers' => $totalCustomers,
                'activeCustomers' => $activeCustomers,
                'newCustomersThisMonth' => $newCustomersThisMonth,
                'vipCustomers' => $vipCustomers,
            ],
        ]);
    }

    /**
     * Financial summary - Income/Expense totals.
     */
    public function financialSummary(Request $request)
    {
        [$startDate, $endDate] = array_slice($this->resolveDateRanges($request), 0, 2);

        $totalIncome = (float) FinancialTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('transaction_type', 'income')
            ->sum('amount');

        $totalExpenses = (float) FinancialTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('transaction_type', 'expense')
            ->sum('amount');

        $netProfit = $totalIncome - $totalExpenses;
        $profitMargin = $totalIncome > 0 ? round(($netProfit / $totalIncome) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'totalIncome' => $totalIncome,
                'totalExpenses' => $totalExpenses,
                'netProfit' => $netProfit,
                'profitMargin' => $profitMargin,
            ],
        ]);
    }

    /**
     * Top paid customers - Top 10 by total paid amount.
     */
    public function topPaidCustomers(Request $request)
    {
        $limit = (int) ($request->input('limit', 10));
        $limit = $limit > 0 && $limit <= 50 ? $limit : 10;

        // Calculate paid amounts for all customers from payments
        $customerPaidAmounts = DB::table('payments')
            ->select('customer_id')
            ->selectRaw('SUM(CASE WHEN payment_type = "credit" THEN amount ELSE -amount END) as net_paid')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->orderBy('net_paid', 'desc')
            ->limit($limit)
            ->pluck('net_paid', 'customer_id')
            ->toArray();

        // Get customer details for top paid customers
        $customerIds = array_keys($customerPaidAmounts);
        
        if (empty($customerIds)) {
            // If no payments, return customers with most orders
            $customers = Customer::has('orders')
                ->withCount('orders')
                ->orderBy('orders_count', 'desc')
                ->limit($limit)
                ->get();
        } else {
            $customers = Customer::whereIn('id', $customerIds)
                ->get()
                ->sortByDesc(function ($customer) use ($customerPaidAmounts) {
                    return $customerPaidAmounts[$customer->id] ?? 0;
                })
                ->take($limit)
                ->values();
        }

        $customers = $customers->map(function ($customer) use ($customerPaidAmounts) {
            $lastPayment = Payment::where('customer_id', $customer->id)
                ->orderBy('payment_date', 'desc')
                ->value('payment_date');
            
            $totalPaid = isset($customerPaidAmounts[$customer->id]) 
                ? (float) $customerPaidAmounts[$customer->id] 
                : (float) ($customer->paid_amount ?? 0);
            
            return [
                'id' => $customer->id,
                'customerCode' => $customer->customer_code,
                'name' => trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')),
                'email' => $customer->email,
                'phone' => $customer->phone ?? $customer->mobile,
                'totalPaid' => $totalPaid,
                'totalOrders' => (int) ($customer->total_orders ?? 0),
                'lastPaymentDate' => $lastPayment,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Upcoming customer events - DOB and Anniversary (next 30 days).
     */
    public function upcomingEvents(Request $request)
    {
        $days = (int) ($request->input('days', 30));
        $days = $days > 0 && $days <= 90 ? $days : 30;

        $today = Carbon::today();
        $endDate = (clone $today)->addDays($days);

        $events = collect();

        // Get customers with DOB in next 30 days
        $customersWithDOB = Customer::whereNotNull('dob')
            ->get()
            ->filter(function ($customer) use ($today, $endDate) {
                if (!$customer->dob) return false;
                
                $dob = Carbon::parse($customer->dob);
                $thisYearDOB = Carbon::create($today->year, $dob->month, $dob->day);
                
                // If this year's DOB has passed, check next year
                if ($thisYearDOB->lt($today)) {
                    $thisYearDOB->addYear();
                }
                
                return $thisYearDOB->between($today, $endDate);
            })
            ->map(function ($customer) use ($today) {
                $dob = Carbon::parse($customer->dob);
                $thisYearDOB = Carbon::create($today->year, $dob->month, $dob->day);
                
                if ($thisYearDOB->lt($today)) {
                    $thisYearDOB->addYear();
                }
                
                return [
                    'customerId' => $customer->id,
                    'customerCode' => $customer->customer_code,
                    'customerName' => trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')),
                    'eventType' => 'birthday',
                    'eventDate' => $thisYearDOB->toDateString(),
                    'daysUntil' => $today->diffInDays($thisYearDOB),
                ];
            });

        // Get customers with Anniversary in next 30 days
        $customersWithAnniversary = Customer::whereNotNull('anniversary_date')
            ->get()
            ->filter(function ($customer) use ($today, $endDate) {
                if (!$customer->anniversary_date) return false;
                
                $anniversary = Carbon::parse($customer->anniversary_date);
                $thisYearAnniversary = Carbon::create($today->year, $anniversary->month, $anniversary->day);
                
                // If this year's anniversary has passed, check next year
                if ($thisYearAnniversary->lt($today)) {
                    $thisYearAnniversary->addYear();
                }
                
                return $thisYearAnniversary->between($today, $endDate);
            })
            ->map(function ($customer) use ($today) {
                $anniversary = Carbon::parse($customer->anniversary_date);
                $thisYearAnniversary = Carbon::create($today->year, $anniversary->month, $anniversary->day);
                
                if ($thisYearAnniversary->lt($today)) {
                    $thisYearAnniversary->addYear();
                }
                
                return [
                    'customerId' => $customer->id,
                    'customerCode' => $customer->customer_code,
                    'customerName' => trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')),
                    'eventType' => 'anniversary',
                    'eventDate' => $thisYearAnniversary->toDateString(),
                    'daysUntil' => $today->diffInDays($thisYearAnniversary),
                ];
            });

        $events = $customersWithDOB
            ->concat($customersWithAnniversary)
            ->sortBy('eventDate')
            ->take(20)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    /**
     * Upcoming orders - Orders with upcoming order_date (event date).
     */
    public function upcomingOrders(Request $request)
    {
        $limit = (int) ($request->input('limit', 10));
        $limit = $limit > 0 && $limit <= 50 ? $limit : 10;

        $today = Carbon::today();

        // Get orders with upcoming order_date (event date >= today)
        $orders = Order::with(['customer:id,first_name,last_name,customer_code'])
            ->where('status', '!=', 'cancelled')
            ->where('order_date', '>=', $today->toDateString())
            ->orderBy('order_date', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderNumber' => $order->order_number,
                    'customerName' => $order->customer 
                        ? trim(($order->customer->first_name ?? '') . ' ' . ($order->customer->last_name ?? ''))
                        : 'N/A',
                    'customerCode' => $order->customer->customer_code ?? null,
                    'orderDate' => $order->order_date,
                    'status' => $order->status,
                    'totalAmount' => (float) ($order->total_amount ?? 0),
                    'remainingAmount' => (float) ($order->remaining_amount ?? 0),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Last transactions - Combined payments and financial transactions (last 10).
     */
    public function lastTransactions(Request $request)
    {
        $limit = (int) ($request->input('limit', 10));
        $limit = $limit > 0 && $limit <= 50 ? $limit : 10;

        // Get last payments
        $payments = Payment::with(['customer:id,first_name,last_name,customer_code', 'order:id,order_number'])
            ->latest('payment_date')
            ->limit($limit)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'payment',
                    'reference' => $payment->payment_number,
                    'orderNumber' => $payment->order->order_number ?? null,
                    'customerId' => $payment->customer_id,
                    'customerName' => $payment->customer 
                        ? trim(($payment->customer->first_name ?? '') . ' ' . ($payment->customer->last_name ?? ''))
                        : 'N/A',
                    'customerCode' => $payment->customer->customer_code ?? null,
                    'transactionDate' => $payment->payment_date,
                    'amount' => (float) $payment->amount,
                    'paymentType' => $payment->payment_type, // credit or debit
                    'paymentMethod' => $payment->payment_method,
                    'description' => $payment->remarks,
                ];
            });

        // Get last financial transactions
        $financialTransactions = FinancialTransaction::with(['category:id,name', 'createdBy:id,first_name,last_name'])
            ->latest('transaction_date')
            ->limit($limit)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => 'financial',
                    'reference' => $transaction->transaction_number,
                    'orderNumber' => null,
                    'customerName' => null,
                    'customerCode' => null,
                    'transactionDate' => $transaction->transaction_date,
                    'amount' => (float) $transaction->amount,
                    'paymentType' => $transaction->transaction_type, // income or expense
                    'paymentMethod' => null,
                    'description' => $transaction->description,
                    'category' => $transaction->category->name ?? null,
                ];
            });

        // Combine and sort by date
        $allTransactions = $payments
            ->concat($financialTransactions)
            ->sortByDesc('transactionDate')
            ->take($limit)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $allTransactions,
        ]);
    }

    /**
     * Company health chart - Combined data (orders, income, expenses, profit over time).
     */
    public function companyHealthChart(Request $request)
    {
        $months = (int) ($request->input('months', 12));
        $months = $months > 0 && $months <= 24 ? $months : 12;

        $endDate = Carbon::now()->endOfMonth();
        $startDate = (clone $endDate)->subMonths($months - 1)->startOfMonth();

        $chartData = [];
        $cursor = (clone $startDate);

        while ($cursor->lte($endDate)) {
            $monthStart = (clone $cursor)->startOfMonth();
            $monthEnd = (clone $cursor)->endOfMonth();
            $monthKey = $cursor->format('Y-m');

            // Orders revenue (from payments)
            $ordersRevenue = (float) Payment::whereBetween('payment_date', [$monthStart, $monthEnd])
                ->where('payment_type', 'credit')
                ->sum('amount');

            // Income
            $income = (float) FinancialTransaction::whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->where('transaction_type', 'income')
                ->sum('amount');

            // Expenses
            $expenses = (float) FinancialTransaction::whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->where('transaction_type', 'expense')
                ->sum('amount');

            // Company Profit = Orders Revenue + Income - Expenses
            $companyProfit = $ordersRevenue + $income - $expenses;

            $chartData[] = [
                'month' => $monthKey,
                'monthLabel' => $cursor->format('M Y'),
                'ordersRevenue' => $ordersRevenue,
                'income' => $income,
                'expenses' => $expenses,
                'companyProfit' => $companyProfit,
            ];

            $cursor->addMonth();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'months' => $months,
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
                'points' => $chartData,
            ],
        ]);
    }
}

