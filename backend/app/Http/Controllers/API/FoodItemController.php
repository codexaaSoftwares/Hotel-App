<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Controllers\Concerns\GeneratesStorageUrl;
use App\Http\Requests\FoodItemStoreRequest;
use App\Http\Requests\FoodItemUpdateRequest;
use App\Http\Resources\FoodItemResource;
use App\Models\FoodItem;
use Illuminate\Http\Request;

class FoodItemController extends Controller
{
    use PaginatesResults, GeneratesStorageUrl;

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

        // Default ordering by display_order when category_id is provided
        $defaultSort = ['column' => 'created_at', 'direction' => 'desc'];
        if ($request->input('category_id')) {
            $defaultSort = ['column' => 'display_order', 'direction' => 'asc'];
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'price', 'status', 'food_type', 'display_order', 'is_popular', 'created_at'],
            $defaultSort
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
     * Get popular food items for POS Panel.
     */
    public function popular(Request $request)
    {
        $query = FoodItem::with('foodCategory')
            ->where('status', 'active')
            ->where('is_popular', true)
            ->ordered();

        // Limit popular items (optional, default: 20)
        $limit = $request->input('limit', 20);
        
        $items = $query->limit($limit)->get();

        $itemsData = array_map(
            fn (FoodItem $item) => (new FoodItemResource($item))->toArray($request),
            $items->all()
        );

        return response()->json([
            'success' => true,
            'data' => $itemsData,
            'meta' => [
                'total' => $items->count(),
            ],
        ]);
    }

    /**
     * Store a newly created food item.
     */
    public function store(FoodItemStoreRequest $request)
    {
        $data = $request->validated();
        
        // Set display_order if not provided
        if (!isset($data['display_order'])) {
            $maxOrder = FoodItem::where('food_category_id', $data['food_category_id'])
                ->max('display_order') ?? 0;
            $data['display_order'] = $maxOrder + 1;
        }

        $item = FoodItem::create($data);
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

    /**
     * Upload image for food item.
     */
    public function uploadImage(Request $request, FoodItem $foodItem)
    {
        try {
            $validated = $request->validate([
                'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // 2MB max
            ]);

            // Delete old image if exists
            if ($foodItem->image) {
                $oldPath = storage_path('app/public/' . $foodItem->image);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Store new image
            $file = $request->file('image');
            $filename = 'food_item_' . $foodItem->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/food-items', $filename);
            
            // Get relative path for storage (without 'public/' prefix)
            $relativePath = 'food-items/' . $filename;

            // Update food item image
            $foodItem->image = $relativePath;
            $foodItem->save();

            // Generate storage URL
            $imageUrl = $this->getStorageUrl($relativePath);

            // Reload food item
            $foodItem->refresh();
            $foodItem->load('foodCategory');

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => (new FoodItemResource($foodItem))->toArray($request),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Food item image upload error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete image for food item.
     */
    public function deleteImage(FoodItem $foodItem)
    {
        try {
            if ($foodItem->image) {
                $oldPath = storage_path('app/public/' . $foodItem->image);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $foodItem->image = null;
            $foodItem->save();

            $foodItem->load('foodCategory');

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
                'data' => (new FoodItemResource($foodItem))->toArray(request()),
            ]);
        } catch (\Exception $e) {
            \Log::error('Food item image delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Move item up (decrease display_order).
     */
    public function moveUp(FoodItem $foodItem)
    {
        try {
            $categoryItems = FoodItem::where('food_category_id', $foodItem->food_category_id)
                ->where('status', 'active')
                ->orderBy('display_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            $currentIndex = $categoryItems->search(function ($item) use ($foodItem) {
                return $item->id === $foodItem->id;
            });

            if ($currentIndex === false || $currentIndex === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item cannot be moved up',
                ], 400);
            }

            $previousItem = $categoryItems[$currentIndex - 1];

            // Swap display orders
            $tempOrder = $foodItem->display_order;
            $foodItem->display_order = $previousItem->display_order;
            $previousItem->display_order = $tempOrder;

            $foodItem->save();
            $previousItem->save();

            $foodItem->load('foodCategory');

            return response()->json([
                'success' => true,
                'message' => 'Item moved up successfully',
                'data' => (new FoodItemResource($foodItem))->toArray(request()),
            ]);
        } catch (\Exception $e) {
            \Log::error('Food item move up error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to move item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Move item down (increase display_order).
     */
    public function moveDown(FoodItem $foodItem)
    {
        try {
            $categoryItems = FoodItem::where('food_category_id', $foodItem->food_category_id)
                ->where('status', 'active')
                ->orderBy('display_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            $currentIndex = $categoryItems->search(function ($item) use ($foodItem) {
                return $item->id === $foodItem->id;
            });

            if ($currentIndex === false || $currentIndex >= $categoryItems->count() - 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item cannot be moved down',
                ], 400);
            }

            $nextItem = $categoryItems[$currentIndex + 1];

            // Swap display orders
            $tempOrder = $foodItem->display_order;
            $foodItem->display_order = $nextItem->display_order;
            $nextItem->display_order = $tempOrder;

            $foodItem->save();
            $nextItem->save();

            $foodItem->load('foodCategory');

            return response()->json([
                'success' => true,
                'message' => 'Item moved down successfully',
                'data' => (new FoodItemResource($foodItem))->toArray(request()),
            ]);
        } catch (\Exception $e) {
            \Log::error('Food item move down error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to move item: ' . $e->getMessage()
            ], 500);
        }
    }

}

