<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\FinancialCategoryStoreRequest;
use App\Http\Requests\FinancialCategoryUpdateRequest;
use App\Http\Resources\FinancialCategoryResource;
use App\Models\FinancialCategory;
use Illuminate\Http\Request;

class FinancialCategoryController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of financial categories.
     */
    public function index(Request $request)
    {
        $query = FinancialCategory::query();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'type', 'status', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $categories = array_map(
            fn (FinancialCategory $category) => (new FinancialCategoryResource($category))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $categories,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created financial category.
     */
    public function store(FinancialCategoryStoreRequest $request)
    {
        $category = FinancialCategory::create($request->validated());

        return (new FinancialCategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Financial category created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified financial category.
     */
    public function show(FinancialCategory $category)
    {
        return (new FinancialCategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Financial category retrieved successfully.',
            ]);
    }

    /**
     * Update the specified financial category.
     */
    public function update(FinancialCategoryUpdateRequest $request, FinancialCategory $category)
    {
        $category->update($request->validated());

        return (new FinancialCategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Financial category updated successfully.',
            ]);
    }

    /**
     * Remove the specified financial category.
     */
    public function destroy(FinancialCategory $category)
    {
        // Check if category has transactions
        if ($category->transactions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category. It has associated transactions.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Financial category deleted successfully.',
        ]);
    }
}
