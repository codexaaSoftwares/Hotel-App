<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PackageType;
use Illuminate\Http\Request;

class PackageTypeController extends Controller
{
    /**
     * Get all active package types.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = PackageType::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: only active types
            $query->active();
        }

        // Order by name
        $packageTypes = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $packageTypes->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'value' => $type->name, // For frontend compatibility
                    'label' => $type->name, // For frontend compatibility
                    'description' => $type->description,
                    'status' => $type->status,
                ];
            }),
        ]);
    }
}
