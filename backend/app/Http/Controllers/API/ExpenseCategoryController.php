<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\ExpenseCategoryStoreRequest;
use App\Http\Requests\ExpenseCategoryUpdateRequest;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of expense categories.
     */
    public function index(Request $request)
    {
        $query = ExpenseCategory::query();

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'status', 'created_at'],
            ['column' => 'name', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $categories = array_map(
            fn (ExpenseCategory $category) => (new ExpenseCategoryResource($category))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $categories,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created expense category.
     */
    public function store(ExpenseCategoryStoreRequest $request)
    {
        $category = ExpenseCategory::create($request->validated());

        return (new ExpenseCategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Expense category created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified expense category.
     */
    public function show(ExpenseCategory $expenseCategory)
    {
        return (new ExpenseCategoryResource($expenseCategory))
            ->additional([
                'success' => true,
                'message' => 'Expense category retrieved successfully.',
            ]);
    }

    /**
     * Update the specified expense category.
     */
    public function update(ExpenseCategoryUpdateRequest $request, ExpenseCategory $expenseCategory)
    {
        $expenseCategory->update($request->validated());

        return (new ExpenseCategoryResource($expenseCategory))
            ->additional([
                'success' => true,
                'message' => 'Expense category updated successfully.',
            ]);
    }

    /**
     * Remove the specified expense category (soft delete).
     */
    public function destroy(ExpenseCategory $expenseCategory)
    {
        $expenseCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense category deleted successfully.',
        ]);
    }
}

