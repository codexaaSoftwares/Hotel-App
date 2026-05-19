<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\RoomCategoryStoreRequest;
use App\Http\Requests\RoomCategoryUpdateRequest;
use App\Http\Resources\RoomCategoryResource;
use App\Models\RoomCategory;
use Illuminate\Http\Request;

class RoomCategoryController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of room categories.
     */
    public function index(Request $request)
    {
        $query = RoomCategory::query();

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

        // Default ordering by name
        if (!$request->has('sort_by')) {
            $query->orderBy('name', 'asc');
        }

        // Build query for all records (for data field)
        $allQuery = clone $query;
        $allCategories = $allQuery->get();

        // Build paginator for metadata
        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'base_price', 'max_adults', 'max_children', 'status', 'created_at'],
            ['column' => 'name', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        // Transform all records for data field
        $allCategoriesData = array_map(
            function (RoomCategory $category) use ($request) {
                return (new RoomCategoryResource($category))->toArray($request);
            },
            $allCategories->all()
        );

        return response()->json([
            'success' => true,
            'data' => $allCategoriesData,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created room category.
     */
    public function store(RoomCategoryStoreRequest $request)
    {
        $category = RoomCategory::create($request->validated());

        return (new RoomCategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Room category created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified room category.
     */
    public function show(RoomCategory $roomCategory)
    {
        return (new RoomCategoryResource($roomCategory))
            ->additional([
                'success' => true,
                'message' => 'Room category retrieved successfully.',
            ]);
    }

    /**
     * Update the specified room category.
     */
    public function update(RoomCategoryUpdateRequest $request, RoomCategory $roomCategory)
    {
        $roomCategory->update($request->validated());

        return (new RoomCategoryResource($roomCategory))
            ->additional([
                'success' => true,
                'message' => 'Room category updated successfully.',
            ]);
    }

    /**
     * Remove the specified room category.
     */
    public function destroy(RoomCategory $roomCategory)
    {
        $roomCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room category deleted successfully.',
        ]);
    }
}

