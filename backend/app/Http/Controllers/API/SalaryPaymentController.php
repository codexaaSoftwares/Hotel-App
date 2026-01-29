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
        $query = SalaryPayment::with('staff');

        // Search functionality
        if ($search = $request->input('search')) {
            $query->whereHas('staff', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
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
            ['payment_date', 'paid_amount', 'created_at'],
            ['column' => 'payment_date', 'direction' => 'desc']
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
        $query = $staff->salaryPayments()->with('staff');

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->where('payment_date', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->where('payment_date', '<=', $endDate);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['payment_date', 'paid_amount', 'created_at'],
            ['column' => 'payment_date', 'direction' => 'desc']
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

        return (new SalaryPaymentResource($salaryPayment->load('staff')))
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
        return (new SalaryPaymentResource($salaryPayment->load('staff')))
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

        return (new SalaryPaymentResource($salaryPayment->load('staff')))
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
