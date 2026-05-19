<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\ExpenseStoreRequest;
use App\Http\Requests\ExpenseUpdateRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of expenses.
     */
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'creator']);

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Payment method filter
        if ($paymentMethod = $request->input('payment_method')) {
            $query->where('payment_method', $paymentMethod);
        }

        // Date range filters
        if ($startDate = $request->input('start_date')) {
            $query->where('expense_date', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->where('expense_date', '<=', $endDate);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['expense_date', 'amount', 'payment_method', 'created_at'],
            ['column' => 'expense_date', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $expenses = array_map(
            fn (Expense $expense) => (new ExpenseResource($expense))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $expenses,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created expense.
     */
    public function store(ExpenseStoreRequest $request)
    {
        $validated = $request->validated();
        
        // Ensure snake_case field names for database
        $data = [
            'category_id' => $validated['category_id'] ?? $validated['categoryId'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'expense_date' => $validated['expense_date'] ?? $validated['expenseDate'] ?? null,
            'payment_method' => $validated['payment_method'] ?? $validated['paymentMethod'] ?? null,
            'description' => $validated['description'] ?? null,
            'created_by' => Auth::id(),
        ];

        $expense = Expense::create($data);

        // Load relationships
        $expense->load(['category', 'creator']);

        return (new ExpenseResource($expense))
            ->additional([
                'success' => true,
                'message' => 'Expense created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified expense.
     */
    public function show(Expense $expense)
    {
        $expense->load(['category', 'creator']);

        return (new ExpenseResource($expense))
            ->additional([
                'success' => true,
                'message' => 'Expense retrieved successfully.',
            ]);
    }

    /**
     * Update the specified expense.
     */
    public function update(ExpenseUpdateRequest $request, Expense $expense)
    {
        $validated = $request->validated();
        
        // Ensure snake_case field names for database
        $data = [
            'category_id' => $validated['category_id'] ?? $validated['categoryId'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'expense_date' => $validated['expense_date'] ?? $validated['expenseDate'] ?? null,
            'payment_method' => $validated['payment_method'] ?? $validated['paymentMethod'] ?? null,
            'description' => $validated['description'] ?? null,
        ];

        $expense->update($data);

        // Reload relationships
        $expense->load(['category', 'creator']);

        return (new ExpenseResource($expense))
            ->additional([
                'success' => true,
                'message' => 'Expense updated successfully.',
            ]);
    }

    /**
     * Remove the specified expense (soft delete).
     */
    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully.',
        ]);
    }
}

