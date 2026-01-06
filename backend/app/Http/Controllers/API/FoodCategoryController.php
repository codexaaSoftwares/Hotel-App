<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\FoodCategoryStoreRequest;
use App\Http\Requests\FoodCategoryUpdateRequest;
use App\Http\Resources\FoodCategoryResource;
use App\Models\FoodCategory;
use Illuminate\Http\Request;

class FoodCategoryController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of food categories.
     */
    public function index(Request $request)
    {
        $query = FoodCategory::query();

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

        // Default ordering by display_order, then name
        if (!$request->has('sort_by')) {
            $query->ordered();
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'display_order', 'status', 'created_at'],
            ['column' => 'display_order', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $categories = array_map(
            fn (FoodCategory $category) => (new FoodCategoryResource($category))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $categories,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created food category.
     */
    public function store(FoodCategoryStoreRequest $request)
    {
        $category = FoodCategory::create($request->validated());

        return (new FoodCategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Food category created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified food category.
     */
    public function show(FoodCategory $foodCategory)
    {
        return (new FoodCategoryResource($foodCategory))
            ->additional([
                'success' => true,
                'message' => 'Food category retrieved successfully.',
            ]);
    }

    /**
     * Update the specified food category.
     */
    public function update(FoodCategoryUpdateRequest $request, FoodCategory $foodCategory)
    {
        $foodCategory->update($request->validated());

        return (new FoodCategoryResource($foodCategory))
            ->additional([
                'success' => true,
                'message' => 'Food category updated successfully.',
            ]);
    }

    /**
     * Remove the specified food category.
     */
    public function destroy(FoodCategory $foodCategory)
    {
        $foodCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Food category deleted successfully.',
        ]);
    }
}

