<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\CustomerStoreRequest;
use App\Http\Requests\CustomerUpdateRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of customers.
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_code', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Customer type filter
        if ($customerType = $request->input('customer_type')) {
            $query->where('customer_type', $customerType);
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // City filter
        if ($city = $request->input('city')) {
            $query->where('city', 'like', "%{$city}%");
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'customer_code', 'mobile', 'email', 'city', 'customer_type', 'status', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $customers = array_map(
            fn (Customer $customer) => (new CustomerResource($customer))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $customers,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(CustomerStoreRequest $request)
    {
        $customer = Customer::create($request->validated());

        return (new CustomerResource($customer))
            ->additional([
                'success' => true,
                'message' => 'Customer created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer)
    {
        return (new CustomerResource($customer))
            ->additional([
                'success' => true,
                'message' => 'Customer retrieved successfully.',
            ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(CustomerUpdateRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return (new CustomerResource($customer))
            ->additional([
                'success' => true,
                'message' => 'Customer updated successfully.',
            ]);
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully.',
        ]);
    }
}

