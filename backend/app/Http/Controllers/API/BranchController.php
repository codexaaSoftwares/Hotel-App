<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\BranchStoreRequest;
use App\Http\Requests\BranchUpdateRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of branches.
     */
    public function index(Request $request)
    {
        $query = Branch::query();

        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('branch_name', 'like', "%{$search}%")
                    ->orWhere('branch_code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($city = $request->input('city')) {
            $query->where('city', 'like', "%{$city}%");
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['branch_name', 'branch_code', 'city', 'created_at', 'status'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $branches = array_map(
            fn (Branch $branch) => (new BranchResource($branch))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $branches,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created branch.
     */
    public function store(BranchStoreRequest $request)
    {
        $branch = Branch::create($request->validated());

        return (new BranchResource($branch))
            ->additional([
                'success' => true,
                'message' => 'Branch created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified branch.
     */
    public function show(Branch $branch)
    {
        return (new BranchResource($branch))
            ->additional([
                'success' => true,
                'message' => 'Branch retrieved successfully.',
            ]);
    }

    /**
     * Update the specified branch.
     */
    public function update(BranchUpdateRequest $request, Branch $branch)
    {
        $branch->update($request->validated());

        return (new BranchResource($branch))
            ->additional([
                'success' => true,
                'message' => 'Branch updated successfully.',
            ]);
    }

    /**
     * Remove the specified branch.
     */
    public function destroy(Branch $branch)
    {
        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Branch deleted successfully.',
        ]);
    }
}

