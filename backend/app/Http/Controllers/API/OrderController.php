<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\OrderStoreRequest;
use App\Http\Requests\OrderUpdateRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\Setting;
use App\Services\PdfExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'branch', 'items.package', 'payments']);

        $this->applyOrderFilters($query, $request);

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['order_number', 'order_date', 'due_date', 'total_amount', 'status', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $orders = array_map(
            fn (Order $order) => (new OrderResource($order))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $orders,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(OrderStoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $items = $data['items'];
            unset($data['items']);

            // Generate order number if not provided
            if (empty($data['order_number'])) {
                $lastOrder = Order::withTrashed()->orderBy('id', 'desc')->first();
                $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
                $data['order_number'] = '#ORD' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
            }

            // Calculate subtotal from items if not provided
            if (!isset($data['subtotal']) || $data['subtotal'] == 0) {
                $data['subtotal'] = collect($items)->sum(function ($item) {
                    return ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
                });
            }

            // Calculate total_amount if not provided
            if (!isset($data['total_amount']) || $data['total_amount'] == 0) {
                $data['total_amount'] = $data['subtotal'] - ($data['discount'] ?? 0);
            }

            // Create order
            $order = Order::create($data);

            // Create order items
            foreach ($items as $itemData) {
                $package = Package::find($itemData['package_id']);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'package_id' => $itemData['package_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                    'package_name' => $package?->package_name,
                ]);
            }

            // Recalculate order subtotal (this will also update customer stats via model events)
            $order->updateSubtotal();

            DB::commit();

            $order->load('customer', 'branch', 'items.package', 'payments');

            return (new OrderResource($order))
                ->additional([
                    'success' => true,
                    'message' => 'Order created successfully.',
                ])
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load([
            'customer',
            'branch',
            'items.package',
            'payments' => function ($query) {
                $query->orderBy('payment_date', 'desc')
                    ->orderBy('created_at', 'desc');
            }
        ]);

        return (new OrderResource($order))
            ->additional([
                'success' => true,
                'message' => 'Order retrieved successfully.',
            ]);
    }

    /**
     * Update the specified order.
     */
    public function update(OrderUpdateRequest $request, Order $order)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $items = $data['items'] ?? null;
            unset($data['items']);

            // Update order
            if (!empty($data)) {
                $order->update($data);
            }

            // Update items if provided
            if ($items !== null) {
                // Delete existing items
                $order->items()->delete();

                // Create new items
                foreach ($items as $itemData) {
                    $package = Package::find($itemData['package_id']);
                    
                    OrderItem::create([
                        'order_id' => $order->id,
                        'package_id' => $itemData['package_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                        'package_name' => $package?->package_name,
                    ]);
                }

                // Recalculate order subtotal
                $order->updateSubtotal();
            }

            DB::commit();

        $order->load('customer', 'branch', 'items.package', 'payments');

            return (new OrderResource($order))
                ->additional([
                    'success' => true,
                    'message' => 'Order updated successfully.',
                ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully.',
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => ['required', 'in:pending,processing,completed,cancelled'],
        ]);

        $order->update(['status' => $request->status]);

        $order->load('customer', 'branch', 'items.package', 'payments');

        return (new OrderResource($order))
            ->additional([
                'success' => true,
                'message' => 'Order status updated successfully.',
            ]);
    }

    /**
     * Record a payment for the order (legacy endpoint compatibility).
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_type' => ['required', 'in:credit,debit'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'in:cash,upi,card,bank_transfer'],
            'payment_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
        ]);

        $amount = $validated['amount'] ?? $order->remaining_amount;

        if ($amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Nothing to record. Provide an amount greater than zero.',
            ], 422);
        }

        $payment = $order->payments()->create([
            'customer_id' => $order->customer_id,
            'branch_id' => $order->branch_id,
            'payment_date' => $validated['payment_date'] ?? now()->toDateString(),
            'payment_type' => $validated['payment_type'],
            'amount' => $amount,
            'payment_method' => $validated['payment_method'] ?? 'cash',
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $order->refresh()->load('customer', 'branch', 'items.package', 'payments');

        return (new OrderResource($order))
            ->additional([
                'success' => true,
                'message' => 'Payment recorded successfully.',
                'payment' => $payment,
            ]);
    }

    /**
     * Get orders by customer.
     */
    public function getByCustomer(Request $request, $customerId)
    {
        $query = Order::where('customer_id', $customerId)
            ->with(['branch', 'items.package', 'payments']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['order_date', 'total_amount', 'status', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $orders = array_map(
            fn (Order $order) => (new OrderResource($order))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $orders,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Provide order statistics (supports date range filters).
     */
    public function stats(Request $request)
    {
        $query = Order::query();

        $this->applyOrderFilters($query, $request);

        $totalOrders = (clone $query)->count();
        $pendingOrders = (clone $query)->where('status', 'pending')->count();
        $processingOrders = (clone $query)->where('status', 'processing')->count();
        $completedOrders = (clone $query)->where('status', 'completed')->count();
        $cancelledOrders = (clone $query)->where('status', 'cancelled')->count();
        $totalRevenue = (float) (clone $query)->sum('total_amount');
        $averageOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'totalOrders' => $totalOrders,
                'pendingOrders' => $pendingOrders,
                'processingOrders' => $processingOrders,
                'completedOrders' => $completedOrders,
                'cancelledOrders' => $cancelledOrders,
                'totalRevenue' => $totalRevenue,
                'averageOrderValue' => $averageOrderValue,
            ],
        ]);
    }

    /**
     * Export order data to PDF.
     */
    public function exportPdf(Order $order, PdfExportService $pdfService)
    {
        $order->load([
            'customer',
            'branch',
            'items.package',
            'payments' => function ($query) {
                $query->orderBy('payment_date', 'desc');
            }
        ]);

        // Get business & invoice settings for PDF branding
        $settings = Setting::businessInfo([
            'invoice_business_name',
            'invoice_business_website',
            'invoice_business_address',
            'invoice_contact_phone',
            'invoice_contact_email',
            'invoice_footer_text',
            'invoice_prefix',
            'business_logo',
        ]);

        $invoicePrefix = trim($settings['invoice_prefix'] ?? 'INV');
        $orderNumber = $order->order_number ?? $order->id;
        $invoiceNumber = $invoicePrefix !== '' ? $invoicePrefix . $orderNumber : $orderNumber;

        // Get customer name safely
        $customer = $order->customer;
        $customerName = 'Customer';
        if ($customer) {
            $firstName = $customer->first_name ?? '';
            $lastName = $customer->last_name ?? '';
            $fullName = trim($firstName . ' ' . $lastName);
            $customerName = !empty($fullName) ? $fullName : 'Customer';
        }
        
        // Sanitize customer name for filename
        $customerNameSafe = preg_replace('/[^a-zA-Z0-9_\- ]/', '', $customerName);
        $customerNameSafe = str_replace(' ', '_', trim($customerNameSafe)) ?: 'Customer';
        
        // Get order ID
        $orderId = $order->id ?? 'Unknown';

        $data = [
            'order' => $order,
            'settings' => $settings,
            'exportDate' => now()->format('Y-m-d H:i:s'),
            'invoiceNumber' => $invoiceNumber,
        ];

        $filename = "Order_{$orderId}_{$customerNameSafe}.pdf";

        return $pdfService->download('pdfs.order_invoice', $data, $filename);
    }

    protected function applyOrderFilters($query, Request $request): void
    {
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (($status = $request->input('status')) && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($customerId = $request->input('customer_id') ?? $request->input('customerId')) {
            $query->where('customer_id', $customerId);
        }

        if ($branchId = $request->input('branch_id')) {
            $query->where('branch_id', $branchId);
        }

        if ($startDate = $request->input('start_date') ?? $request->input('startDate')) {
            $query->whereDate('order_date', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date') ?? $request->input('endDate')) {
            $query->whereDate('order_date', '<=', $endDate);
        }

        if ($dueDateFrom = $request->input('due_date_from') ?? $request->input('dueDateFrom')) {
            $query->whereDate('due_date', '>=', $dueDateFrom);
        }

        if ($dueDateTo = $request->input('due_date_to') ?? $request->input('dueDateTo')) {
            $query->whereDate('due_date', '<=', $dueDateTo);
        }

        if ($paymentMethod = $request->input('payment_method') ?? $request->input('paymentMethod')) {
            $query->whereExists(function ($sub) use ($paymentMethod) {
                $sub->selectRaw(1)
                    ->from('payments')
                    ->whereColumn('payments.order_id', 'orders.id')
                    ->where('payment_method', $paymentMethod);
            });
        }

        if (($paymentStatus = $request->input('payment_status') ?? $request->input('paymentStatus')) && $paymentStatus !== 'all') {
            $this->applyPaymentStatusFilter($query, $paymentStatus);
        }

        if ($minTotalAmount = $request->input('min_total_amount') ?? $request->input('minTotalAmount')) {
            $query->where('total_amount', '>=', $minTotalAmount);
        }

        if ($maxTotalAmount = $request->input('max_total_amount') ?? $request->input('maxTotalAmount')) {
            $query->where('total_amount', '<=', $maxTotalAmount);
        }

        if ($minPaidAmount = $request->input('min_paid_amount') ?? $request->input('minPaidAmount')) {
            $query->whereRaw($this->netPaidExpression() . ' >= ?', [$minPaidAmount]);
        }

        if ($maxPaidAmount = $request->input('max_paid_amount') ?? $request->input('maxPaidAmount')) {
            $query->whereRaw($this->netPaidExpression() . ' <= ?', [$maxPaidAmount]);
        }

        $minRemainingAmount = $request->input('min_remaining_amount')
            ?? $request->input('minRemainingAmount')
            ?? $request->input('min_balance_amount')
            ?? $request->input('minBalanceAmount');
        if ($minRemainingAmount !== null) {
            $query->whereRaw($this->remainingAmountExpression() . ' >= ?', [$minRemainingAmount]);
        }

        $maxRemainingAmount = $request->input('max_remaining_amount')
            ?? $request->input('maxRemainingAmount')
            ?? $request->input('max_balance_amount')
            ?? $request->input('maxBalanceAmount');
        if ($maxRemainingAmount !== null) {
            $query->whereRaw($this->remainingAmountExpression() . ' <= ?', [$maxRemainingAmount]);
        }
    }

    protected function netPaidExpression(): string
    {
        return "(SELECT COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN amount ELSE 0 END), 0)
                 - COALESCE(SUM(CASE WHEN payment_type = 'debit' THEN amount ELSE 0 END), 0)
            FROM payments
            WHERE payments.order_id = orders.id)";
    }

    protected function remainingAmountExpression(): string
    {
        return "(orders.total_amount - {$this->netPaidExpression()})";
    }

    protected function refundCountExpression(): string
    {
        return "(SELECT COUNT(*) FROM payments WHERE payments.order_id = orders.id AND payment_type = 'debit')";
    }

    protected function applyPaymentStatusFilter($query, string $paymentStatus): void
    {
        $netPaid = $this->netPaidExpression();
        $refunds = $this->refundCountExpression();

        switch ($paymentStatus) {
            case 'completed':
            case 'paid':
                $query->whereRaw("{$netPaid} >= orders.total_amount")
                    ->where('total_amount', '>', 0);
                break;
            case 'refunded':
                $query->whereRaw("{$netPaid} <= 0")
                    ->whereRaw("{$refunds} > 0");
                break;
            case 'pending':
            case 'partial':
            default:
                $query->where(function ($builder) use ($netPaid) {
                    $builder->whereRaw("{$netPaid} < orders.total_amount")
                        ->orWhere('orders.total_amount', '<=', 0);
                });
        }
    }
}
