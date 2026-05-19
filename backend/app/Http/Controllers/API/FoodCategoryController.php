<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\FoodCategoryStoreRequest;
use App\Http\Requests\FoodCategoryUpdateRequest;
use App\Http\Resources\FoodCategoryResource;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Setting;
use App\Services\PdfExportService;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
                        'food_type' => $item->food_type,
                        'is_veg' => $item->food_type === 'veg',
                        'status' => $item->status,
                        'image' => $imageUrl,
                        'display_order' => (int) $item->display_order,
                        'isPopular' => (bool) $item->is_popular,
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

    /**
     * Get POS menu (categories hierarchy + popular items).
     * This endpoint combines menu hierarchy and popular items in a single response.
     */
    public function posMenu(Request $request)
    {
        // Get menu hierarchy (categories with their items)
        $categoryQuery = FoodCategory::with(['foodItems' => function ($q) {
            $q->where('status', 'active')
              ->orderBy('display_order', 'asc')
              ->orderBy('name', 'asc');
        }]);

        // Status filter
        if ($status = $request->input('status')) {
            $categoryQuery->where('status', $status);
        } else {
            // Default to active only
            $categoryQuery->where('status', 'active');
        }

        // Order by display_order
        $categoryQuery->ordered();

        $categories = $categoryQuery->get();

        // Format categories with items
        $categoriesData = $categories->map(function ($category) use ($request) {
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
                        $appUrl = rtrim(config('app.url'), '/');
                        $parsedUrl = parse_url($appUrl);
                        $scheme = $parsedUrl['scheme'] ?? 'http';
                        $host = $parsedUrl['host'] ?? 'localhost';
                        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
                        $domain = $scheme . '://' . $host . $port;
                        $imageUrl = $domain . '/admin/api/storage/' . $item->image;
                    }

                    return [
                        'id' => $item->id,
                        'food_category_id' => $item->food_category_id,
                        'category_name' => $category->name,
                        'name' => $item->name,
                        'description' => $item->description,
                        'price' => (float) $item->price,
                        'food_type' => $item->food_type,
                        'is_veg' => $item->food_type === 'veg',
                        'status' => $item->status,
                        'image' => $imageUrl,
                        'display_order' => (int) $item->display_order,
                        'isPopular' => (bool) $item->is_popular,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                    ];
                })->toArray(),
            ];
        })->toArray();

        // Get popular items
        $popularLimit = $request->input('popular_limit', 20);
        $popularItems = FoodItem::with('foodCategory')
            ->where('status', 'active')
            ->where('is_popular', true)
            ->orderBy('is_popular', 'desc')
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->limit($popularLimit)
            ->get();

        // Format popular items
        $popularData = $popularItems->map(function ($item) use ($request) {
            $imageUrl = null;
            if ($item->image) {
                $appUrl = rtrim(config('app.url'), '/');
                $parsedUrl = parse_url($appUrl);
                $scheme = $parsedUrl['scheme'] ?? 'http';
                $host = $parsedUrl['host'] ?? 'localhost';
                $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
                $domain = $scheme . '://' . $host . $port;
                $imageUrl = $domain . '/admin/api/storage/' . $item->image;
            }

            return [
                'id' => $item->id,
                'food_category_id' => $item->food_category_id,
                'category_name' => $item->foodCategory->name ?? '',
                'name' => $item->name,
                'description' => $item->description,
                'price' => (float) $item->price,
                'gst_percentage' => (float) $item->gst_percentage,
                'food_type' => $item->food_type,
                'is_veg' => $item->food_type === 'veg',
                'status' => $item->status,
                'image' => $imageUrl,
                'display_order' => (int) $item->display_order,
                'isPopular' => (bool) $item->is_popular,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categoriesData,
                'popular_items' => $popularData,
            ],
        ]);
    }

    /**
     * Export menu as PDF.
     */
    public function exportMenu(Request $request)
    {
        // Get all categories with their items
        $query = FoodCategory::with(['foodItems' => function ($q) {
            $q->orderBy('display_order', 'asc')
              ->orderBy('name', 'asc');
        }]);

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Order by display_order
        $query->ordered();

        $categories = $query->get();

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Prepare data for PDF
        $data = [
            'categories' => $categories,
            'businessInfo' => [
                'company_name' => $businessName,
                'business_name' => $businessName,
                'businessAddress' => $businessAddress,
                'business_address' => $businessAddress,
                'businessPhone' => $businessPhone,
                'business_phone' => $businessPhone,
                'businessEmail' => $businessEmail,
                'business_email' => $businessEmail,
                'gstNumber' => $gstNumber,
            ],
            'generatedDate' => now()->format('d/m/Y h:i A'),
        ];

        $filename = 'Menu_' . now()->format('Y-m-d') . '.pdf';

        $pdfService = new PdfExportService();
        return $pdfService->export('pdfs.menu', $data, $filename);
    }

    /**
     * Export menu as Excel (CSV format).
     */
    public function exportMenuCsv(Request $request)
    {
        // Get all categories with their items
        $query = FoodCategory::with(['foodItems' => function ($q) {
            $q->orderBy('display_order', 'asc')
              ->orderBy('name', 'asc');
        }]);

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Order by display_order
        $query->ordered();

        $categories = $query->get();

        // Prepare CSV data
        $filename = 'menu_' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($categories) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($file, [
                'Category',
                'Category Description',
                'Item Name',
                'Item Description',
                'Type',
                'Price',
                'Status',
                'Popular',
                'Display Order'
            ]);

            // Data rows
            foreach ($categories as $category) {
                if ($category->foodItems && $category->foodItems->count() > 0) {
                    foreach ($category->foodItems as $item) {
                        fputcsv($file, [
                            $category->name,
                            $category->description ?? 'N/A',
                            $item->name,
                            $item->description ?? 'N/A',
                            ucfirst($item->food_type ?? 'N/A'),
                            number_format($item->price, 2),
                            ucfirst($item->status ?? 'active'),
                            $item->is_popular ? 'Yes' : 'No',
                            $item->display_order ?? 0,
                        ]);
                    }
                } else {
                    // Include category even if no items
                    fputcsv($file, [
                        $category->name,
                        $category->description ?? 'N/A',
                        'N/A',
                        'N/A',
                        'N/A',
                        '0.00',
                        ucfirst($category->status ?? 'active'),
                        'No',
                        '0',
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

