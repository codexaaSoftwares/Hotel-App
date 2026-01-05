<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\FinancialTransactionStoreRequest;
use App\Http\Requests\FinancialTransactionUpdateRequest;
use App\Http\Resources\FinancialTransactionResource;
use App\Models\FinancialTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FinancialTransactionController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of financial transactions.
     */
    public function index(Request $request)
    {
        $query = FinancialTransaction::with(['category', 'createdBy']);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('transaction_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Transaction type filter
        if ($transactionType = $request->input('transaction_type')) {
            $query->where('transaction_type', $transactionType);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Date range filter
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        if ($startDate || $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        // Amount range filter
        $minAmount = $request->input('min_amount');
        $maxAmount = $request->input('max_amount');
        if ($minAmount !== null || $maxAmount !== null) {
            $query->amountRange($minAmount, $maxAmount);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['transaction_number', 'transaction_date', 'amount', 'transaction_type', 'created_at'],
            ['column' => 'transaction_date', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $transactions = array_map(
            fn (FinancialTransaction $transaction) => (new FinancialTransactionResource($transaction))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $transactions,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created financial transaction.
     */
    public function store(FinancialTransactionStoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            // Generate transaction number if not provided
            if (empty($data['transaction_number'])) {
                $type = $data['transaction_type'];
                $prefix = $type === 'income' ? 'INC' : 'EXP';
                
                $lastTransaction = FinancialTransaction::withTrashed()
                    ->where('transaction_type', $type)
                    ->orderBy('id', 'desc')
                    ->first();
                
                $nextId = $lastTransaction ? $lastTransaction->id + 1 : 1;
                $data['transaction_number'] = '#' . $prefix . str_pad($nextId, 3, '0', STR_PAD_LEFT);
            }

            // Set created_by to current user
            $data['created_by'] = Auth::id();

            $transaction = FinancialTransaction::create($data);

            DB::commit();

            $transaction->load(['category', 'createdBy']);

            return (new FinancialTransactionResource($transaction))
                ->additional([
                    'success' => true,
                    'message' => 'Financial transaction created successfully.',
                ])
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create financial transaction.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified financial transaction.
     */
    public function show(FinancialTransaction $transaction)
    {
        $transaction->load(['category', 'createdBy']);

        return (new FinancialTransactionResource($transaction))
            ->additional([
                'success' => true,
                'message' => 'Financial transaction retrieved successfully.',
            ]);
    }

    /**
     * Update the specified financial transaction.
     */
    public function update(FinancialTransactionUpdateRequest $request, FinancialTransaction $transaction)
    {
        $transaction->update($request->validated());

        $transaction->load(['category', 'createdBy']);

        return (new FinancialTransactionResource($transaction))
            ->additional([
                'success' => true,
                'message' => 'Financial transaction updated successfully.',
            ]);
    }

    /**
     * Remove the specified financial transaction.
     */
    public function destroy(FinancialTransaction $transaction)
    {
        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Financial transaction deleted successfully.',
        ]);
    }

    /**
     * Get financial statistics.
     */
    public function stats(Request $request)
    {
        $query = FinancialTransaction::query();

        // Date range filter
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        if ($startDate || $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Transaction type filter
        if ($transactionType = $request->input('transaction_type')) {
            $query->where('transaction_type', $transactionType);
        }

        // Calculate totals
        $totalIncome = (clone $query)->where('transaction_type', 'income')->sum('amount');
        $totalExpenses = (clone $query)->where('transaction_type', 'expense')->sum('amount');
        $netProfit = $totalIncome - $totalExpenses;

        // Income by category
        $incomeByCategory = (clone $query)
            ->where('transaction_type', 'income')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category:id,name,type')
            ->get()
            ->map(function ($item) {
                return [
                    'categoryId' => $item->category_id,
                    'categoryName' => $item->category->name ?? 'N/A',
                    'total' => (float) $item->total,
                ];
            });

        // Expenses by category
        $expensesByCategory = (clone $query)
            ->where('transaction_type', 'expense')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category:id,name,type')
            ->get()
            ->map(function ($item) {
                return [
                    'categoryId' => $item->category_id,
                    'categoryName' => $item->category->name ?? 'N/A',
                    'total' => (float) $item->total,
                ];
            });

        // Monthly trends (last 12 months)
        $monthlyTrends = FinancialTransaction::select(
            DB::raw('YEAR(transaction_date) as year'),
            DB::raw('MONTH(transaction_date) as month'),
            'transaction_type',
            DB::raw('SUM(amount) as total')
        )
            ->whereBetween('transaction_date', [
                now()->subMonths(11)->startOfMonth(),
                now()->endOfMonth()
            ])
            ->groupBy('year', 'month', 'transaction_type')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->groupBy(function ($item) {
                return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
            })
            ->map(function ($group) {
                return [
                    'month' => $group->first()->year . '-' . str_pad($group->first()->month, 2, '0', STR_PAD_LEFT),
                    'income' => (float) ($group->where('transaction_type', 'income')->first()->total ?? 0),
                    'expenses' => (float) ($group->where('transaction_type', 'expense')->first()->total ?? 0),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'totalIncome' => (float) $totalIncome,
                'totalExpenses' => (float) $totalExpenses,
                'netProfit' => (float) $netProfit,
                'incomeByCategory' => $incomeByCategory,
                'expensesByCategory' => $expensesByCategory,
                'monthlyTrends' => $monthlyTrends,
            ],
        ]);
    }
}
