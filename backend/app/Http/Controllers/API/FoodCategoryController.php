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

    /**
     * Get menu hierarchy (categories with their items).
     */
    public function hierarchy(Request $request)
    {
        $query = FoodCategory::with(['foodItems' => function ($q) {
            $q->where('status', 'active')
              ->orderBy('display_order', 'asc')
              ->orderBy('name', 'asc');
        }]);

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        } else {
            // Default to active only
            $query->where('status', 'active');
        }

        // Order by display_order
        $query->ordered();

        $categories = $query->get();

        $data = $categories->map(function ($category) use ($request) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'display_order' => $category->display_order,
                'status' => $category->status,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
                'items' => $category->foodItems->map(function ($item) use ($category, $request) {
                    $imageUrl = null;
                    if ($item->image) {
                        // Use the same URL generation logic as FoodItemResource
                        // Storage files are always served at /admin/api/storage/ (as configured in public/index.php)
                        $appUrl = rtrim(config('app.url'), '/');
                        $parsedUrl = parse_url($appUrl);
                        $scheme = $parsedUrl['scheme'] ?? 'http';
                        $host = $parsedUrl['host'] ?? 'localhost';
                        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
                        
                        // Build domain with port
                        $domain = $scheme . '://' . $host . $port;
                        
                        // Storage files are always served at /admin/api/storage/
                        $imageUrl = $domain . '/admin/api/storage/' . $item->image;
                    }

                    return [
                        'id' => $item->id,
                        'food_category_id' => $item->food_category_id,
                        'category_name' => $category->name,
                        'name' => $item->name,
                        'description' => $item->description,
                        'price' => (float) $item->price,
                        'gst_percentage' => (float) $item->gst_percentage,
                        'food_type' => $item->food_type,
                        'is_veg' => $item->food_type === 'veg',
                        'status' => $item->status,
                        'image' => $imageUrl,
                        'display_order' => (int) $item->display_order,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                    ];
                })->toArray(),
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

