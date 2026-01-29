<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\StaffStoreRequest;
use App\Http\Requests\StaffUpdateRequest;
use App\Http\Resources\StaffResource;
use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of staff.
     */
    public function index(Request $request)
    {
        $query = Staff::query();

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
            });
        }

        // Department filter
        if ($department = $request->input('department')) {
            $query->where('department', 'like', "%{$department}%");
        }

        // Salary type filter
        if ($salaryType = $request->input('salary_type')) {
            $query->where('salary_type', $salaryType);
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'mobile', 'department', 'salary_type', 'status', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $staff = array_map(
            fn (Staff $staff) => (new StaffResource($staff))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $staff,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created staff.
     */
    public function store(StaffStoreRequest $request)
    {
        $staff = Staff::create($request->validated());

        return (new StaffResource($staff))
            ->additional([
                'success' => true,
                'message' => 'Staff created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified staff.
     */
    public function show(Staff $staff)
    {
        return (new StaffResource($staff))
            ->additional([
                'success' => true,
                'message' => 'Staff retrieved successfully.',
            ]);
    }

    /**
     * Update the specified staff.
     */
    public function update(StaffUpdateRequest $request, Staff $staff)
    {
        $staff->update($request->validated());

        return (new StaffResource($staff))
            ->additional([
                'success' => true,
                'message' => 'Staff updated successfully.',
            ]);
    }

    /**
     * Remove the specified staff.
     */
    public function destroy(Staff $staff)
    {
        $staff->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff deleted successfully.',
        ]);
    }
}
