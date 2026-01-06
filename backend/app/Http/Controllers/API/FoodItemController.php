<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\FoodItemStoreRequest;
use App\Http\Requests\FoodItemUpdateRequest;
use App\Http\Resources\FoodItemResource;
use App\Models\FoodItem;
use Illuminate\Http\Request;

class FoodItemController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of food items.
     */
    public function index(Request $request)
    {
        $query = FoodItem::with('foodCategory');

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('foodCategory', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('food_category_id', $categoryId);
        }

        // Food type filter
        if ($foodType = $request->input('food_type')) {
            $query->where('food_type', $foodType);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'price', 'status', 'food_type', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $items = array_map(
            fn (FoodItem $item) => (new FoodItemResource($item))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created food item.
     */
    public function store(FoodItemStoreRequest $request)
    {
        $item = FoodItem::create($request->validated());
        $item->load('foodCategory');

        return (new FoodItemResource($item))
            ->additional([
                'success' => true,
                'message' => 'Food item created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified food item.
     */
    public function show(FoodItem $foodItem)
    {
        $foodItem->load('foodCategory');

        return (new FoodItemResource($foodItem))
            ->additional([
                'success' => true,
                'message' => 'Food item retrieved successfully.',
            ]);
    }

    /**
     * Update the specified food item.
     */
    public function update(FoodItemUpdateRequest $request, FoodItem $foodItem)
    {
        $foodItem->update($request->validated());
        $foodItem->load('foodCategory');

        return (new FoodItemResource($foodItem))
            ->additional([
                'success' => true,
                'message' => 'Food item updated successfully.',
            ]);
    }

    /**
     * Remove the specified food item.
     */
    public function destroy(FoodItem $foodItem)
    {
        $foodItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Food item deleted successfully.',
        ]);
    }
}

