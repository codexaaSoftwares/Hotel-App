<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\TableStoreRequest;
use App\Http\Requests\TableUpdateRequest;
use App\Http\Resources\TableResource;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of tables.
     */
    public function index(Request $request)
    {
        $query = Table::query();

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('table_number', 'like', "%{$search}%")
                    ->orWhere('table_name', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Active filter
        if ($request->has('is_active')) {
            $isActive = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Default ordering by table_number
        if (!$request->has('sort_by')) {
            $query->orderBy('table_number', 'asc');
        }

        // Build query for all records (for data field)
        $allQuery = clone $query;
        $allTables = $allQuery->get();

        // Build paginator for metadata
        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['table_number', 'table_name', 'capacity', 'status', 'is_active', 'created_at'],
            ['column' => 'table_number', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        // Transform all records for data field
        $allTablesData = array_map(
            fn (Table $table) => (new TableResource($table))->toArray($request),
            $allTables->all()
        );

        return response()->json([
            'success' => true,
            'data' => $allTablesData,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created table.
     */
    public function store(TableStoreRequest $request)
    {
        $table = Table::create($request->validated());

        return (new TableResource($table))
            ->additional([
                'success' => true,
                'message' => 'Table created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified table.
     */
    public function show(Table $table)
    {
        return (new TableResource($table))
            ->additional([
                'success' => true,
                'message' => 'Table retrieved successfully.',
            ]);
    }

    /**
     * Update the specified table.
     */
    public function update(TableUpdateRequest $request, Table $table)
    {
        $table->update($request->validated());

        return (new TableResource($table))
            ->additional([
                'success' => true,
                'message' => 'Table updated successfully.',
            ]);
    }

    /**
     * Remove the specified table.
     */
    public function destroy(Table $table)
    {
        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Table deleted successfully.',
        ]);
    }
}

