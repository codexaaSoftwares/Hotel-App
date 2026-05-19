<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\TableStoreRequest;
use App\Http\Requests\TableUpdateRequest;
use App\Http\Resources\TableResource;
use App\Models\Table;
use App\Models\Setting;
use App\Services\PdfExportService;
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

        // Include bill information if requested (for POS Panel)
        $includeBills = $request->boolean('include_bills', false);
        if ($includeBills) {
            $query->withCount([
                'activeBills as active_orders_count',
                'bills as total_orders_count'
            ])->with(['activeBills' => function ($q) {
                $q->select('id', 'bill_number', 'table_id', 'status', 'total_amount', 'created_at')
                  ->orderBy('created_at', 'desc');
            }]);
        }

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

        // Calculate total amount for active bills if needed
        if ($includeBills) {
            $allTables->load('activeBills');
            $allTables->each(function ($table) {
                $table->active_bills_total = $table->activeBills ? $table->activeBills->sum('total_amount') : 0;
            });
        }

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
            function (Table $table) use ($request, $includeBills) {
                $resource = (new TableResource($table))->toArray($request);
                
                // Add bill information if requested
                if ($includeBills) {
                    $resource['active_orders_count'] = $table->active_orders_count ?? 0;
                    $resource['total_orders_count'] = $table->total_orders_count ?? 0;
                    $resource['active_bills_total'] = $table->active_bills_total ?? 0;
                    $resource['active_bills'] = $table->activeBills->map(function ($bill) {
                        return [
                            'id' => $bill->id,
                            'bill_number' => $bill->bill_number,
                            'status' => $bill->status,
                            'total_amount' => $bill->total_amount,
                            'created_at' => $bill->created_at,
                        ];
                    })->values();
                }
                
                return $resource;
            },
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

    /**
     * Export tables as PDF.
     */
    public function exportTables(Request $request)
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

        // Order by table_number
        $query->orderBy('table_number', 'asc');

        $tables = $query->get();

        // Get business info - check multiple possible key variations
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Calculate summary
        $summary = [
            'total' => $tables->count(),
            'available' => $tables->where('status', 'available')->count(),
            'occupied' => $tables->where('status', 'occupied')->count(),
            'reserved' => $tables->where('status', 'reserved')->count(),
            'cleaning' => $tables->where('status', 'cleaning')->count(),
            'maintenance' => $tables->where('status', 'maintenance')->count(),
            'active' => $tables->where('is_active', true)->count(),
            'inactive' => $tables->where('is_active', false)->count(),
        ];

        // Prepare data for PDF
        $data = [
            'tables' => $tables,
            'summary' => $summary,
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

        $filename = 'Tables_' . now()->format('Y-m-d') . '.pdf';

        $pdfService = new PdfExportService();
        return $pdfService->export('pdfs.tables', $data, $filename);
    }
}

