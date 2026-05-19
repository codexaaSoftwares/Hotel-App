<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\AddonServiceStoreRequest;
use App\Http\Requests\AddonServiceUpdateRequest;
use App\Http\Resources\AddonServiceResource;
use App\Models\AddonService;
use Illuminate\Http\Request;

class AddonServiceController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of addon services.
     */
    public function index(Request $request)
    {
        $query = AddonService::query();

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Default ordering by name
        if (!$request->has('sort_by')) {
            $query->orderBy('name', 'asc');
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'charge', 'status', 'created_at'],
            ['column' => 'name', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        return response()->json([
            'success' => true,
            'data' => AddonServiceResource::collection($paginator->items()),
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created addon service.
     */
    public function store(AddonServiceStoreRequest $request)
    {
        $service = AddonService::create($request->validated());

        return (new AddonServiceResource($service))
            ->additional([
                'success' => true,
                'message' => 'Addon service created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified addon service.
     */
    public function show(AddonService $addonService)
    {
        return (new AddonServiceResource($addonService))
            ->additional([
                'success' => true,
                'message' => 'Addon service retrieved successfully.',
            ]);
    }

    /**
     * Update the specified addon service.
     */
    public function update(AddonServiceUpdateRequest $request, AddonService $addonService)
    {
        $addonService->update($request->validated());

        return (new AddonServiceResource($addonService))
            ->additional([
                'success' => true,
                'message' => 'Addon service updated successfully.',
            ]);
    }

    /**
     * Remove the specified addon service.
     */
    public function destroy(AddonService $addonService)
    {
        $addonService->delete();

        return response()->json([
            'success' => true,
            'message' => 'Addon service deleted successfully.',
        ]);
    }
}
