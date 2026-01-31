<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\SalaryPaymentStoreRequest;
use App\Http\Requests\SalaryPaymentUpdateRequest;
use App\Http\Resources\SalaryPaymentResource;
use App\Models\SalaryPayment;
use App\Models\Staff;
use Illuminate\Http\Request;

class SalaryPaymentController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of salary payments.
     */
    public function index(Request $request)
    {
        $query = SalaryPayment::with(['staff', 'creator']);

        // Search functionality - include soft-deleted staff
        if ($search = $request->input('search')) {
            $query->whereHas('staff', function ($q) use ($search) {
                $q->withTrashed()
                  ->where('name', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Month filter
        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }

        // Year filter
        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $salaryPayments = array_map(
            fn (SalaryPayment $payment) => (new SalaryPaymentResource($payment))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $salaryPayments,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Get salary payments for a specific staff member.
     */
    public function getByStaff(Staff $staff, Request $request)
    {
        $query = $staff->salaryPayments()->with(['staff', 'creator']);

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->where('payment_date', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->where('payment_date', '<=', $endDate);
        }

        // Handle custom sorting for month & year combined
        $requestedSort = $request->input('sort_by');
        $sortDirection = strtolower($request->input('sort_direction', 'desc'));
        $sortDirection = $sortDirection === 'desc' ? 'desc' : 'asc';

        if ($requestedSort === 'year_month') {
            // Sort by year first, then by month
            $query->orderBy('year', $sortDirection)
                  ->orderBy('month', $sortDirection);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $salaryPayments = array_map(
            fn (SalaryPayment $payment) => (new SalaryPaymentResource($payment))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $salaryPayments,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created salary payment.
     */
    public function store(SalaryPaymentStoreRequest $request)
    {
        $salaryPayment = SalaryPayment::create($request->validated());

        return (new SalaryPaymentResource($salaryPayment->load(['staff', 'creator'])))
            ->additional([
                'success' => true,
                'message' => 'Salary payment created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified salary payment.
     */
    public function show(SalaryPayment $salaryPayment)
    {
        return (new SalaryPaymentResource($salaryPayment->load(['staff', 'creator'])))
            ->additional([
                'success' => true,
                'message' => 'Salary payment retrieved successfully.',
            ]);
    }

    /**
     * Update the specified salary payment.
     */
    public function update(SalaryPaymentUpdateRequest $request, SalaryPayment $salaryPayment)
    {
        $salaryPayment->update($request->validated());

        return (new SalaryPaymentResource($salaryPayment->load(['staff', 'creator'])))
            ->additional([
                'success' => true,
                'message' => 'Salary payment updated successfully.',
            ]);
    }

    /**
     * Remove the specified salary payment.
     */
    public function destroy(SalaryPayment $salaryPayment)
    {
        $salaryPayment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Salary payment deleted successfully.',
        ]);
    }
}
