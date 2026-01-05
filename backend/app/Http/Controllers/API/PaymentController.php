<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use App\Services\PdfExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        try {
            $query = Payment::with(['order', 'customer', 'branch']);

            // Filter by order_id
            if ($orderId = $request->input('order_id') ?? $request->input('orderId')) {
                $query->where('order_id', $orderId);
            }

            // Filter by customer_id
            if ($customerId = $request->input('customer_id') ?? $request->input('customerId')) {
                $query->where('customer_id', $customerId);
            }

            // Filter by branch_id
            if ($branchId = $request->input('branch_id')) {
                $query->where('branch_id', $branchId);
            }

            // Filter by payment_type
            if ($paymentType = $request->input('payment_type') ?? $request->input('paymentType')) {
                $query->where('payment_type', $paymentType);
            }

            // Filter by payment_method
            if ($paymentMethod = $request->input('payment_method') ?? $request->input('paymentMethod')) {
                $query->where('payment_method', $paymentMethod);
            }

            // Filter by date range
            if ($startDate = $request->input('start_date') ?? $request->input('startDate')) {
                $query->whereDate('payment_date', '>=', $startDate);
            }

            if ($endDate = $request->input('end_date') ?? $request->input('endDate')) {
                $query->whereDate('payment_date', '<=', $endDate);
            }

            // Search
            if ($search = $request->input('search')) {
                $query->where(function ($builder) use ($search) {
                    $builder->where('payment_number', 'like', "%{$search}%")
                        ->orWhereHas('order', function ($q) use ($search) {
                            $q->where('order_number', 'like', "%{$search}%");
                        })
                        ->orWhereHas('customer', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            }

            $pagination = $this->buildPaginator(
                $request,
                $query,
                ['payment_number', 'payment_date', 'amount', 'payment_type', 'payment_method', 'created_at'],
                ['column' => 'created_at', 'direction' => 'desc']
            );

            $paginator = $pagination['paginator'];
            $sortBy = $pagination['sortBy'];
            $sortDirection = $pagination['sortDirection'];

            return response()->json([
                'success' => true,
                'data' => PaymentResource::collection($paginator->items()),
                'meta' => $this->paginationMeta($paginator, $sortBy ?? 'created_at', $sortDirection ?? 'desc'),
            ]);
        } catch (\Exception $e) {
            Log::error('PaymentController@index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load payments: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'customer_id' => ['nullable', 'exists:customers,id'], // Optional - will be set from order
            'branch_id' => ['nullable', 'exists:branches,id'],
            'payment_date' => ['required', 'date'],
            'payment_type' => ['required', 'in:credit,debit'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,upi,card,bank_transfer'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        // Verify order exists and get customer_id from order if not provided
        $order = Order::findOrFail($validated['order_id']);
        
        // Always use order's customer_id (required field)
        if (!isset($validated['customer_id']) || empty($validated['customer_id'])) {
            $validated['customer_id'] = $order->customer_id;
        }
        
        // Validate that provided customer_id matches order's customer_id
        if ($validated['customer_id'] != $order->customer_id) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID does not match the order\'s customer.',
            ], 422);
        }

        // Use order's branch_id if branch_id not provided
        if (!isset($validated['branch_id']) && $order->branch_id) {
            $validated['branch_id'] = $order->branch_id;
        }

        // Validate payment amount based on payment type
        if ($validated['payment_type'] === 'credit') {
            // Credit payment cannot exceed order balance
            $orderRemaining = $order->remaining_amount;
            if ($validated['amount'] > $orderRemaining) {
                return response()->json([
                    'success' => false,
                    'message' => "Payment amount cannot exceed remaining order balance of " . number_format($orderRemaining, 2),
                ], 422);
            }
        } else {
            // Debit (refund) cannot exceed paid amount
            if ($validated['amount'] > $order->paid_amount) {
                return response()->json([
                    'success' => false,
                    'message' => "Refund amount cannot exceed paid amount of " . number_format($order->paid_amount, 2),
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            $payment = Payment::create($validated);

            $this->syncOrderFinancials($order);

            DB::commit();

            $payment->load(['order', 'customer', 'branch']);

            return (new PaymentResource($payment))
                ->additional([
                    'success' => true,
                    'message' => 'Payment recorded successfully.',
                ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified payment.
     */
    public function show(Payment $payment)
    {
        $payment->load(['order', 'customer', 'branch']);

        return (new PaymentResource($payment))
            ->additional([
                'success' => true,
                'message' => 'Payment retrieved successfully.',
            ]);
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'payment_date' => ['sometimes', 'date'],
            'payment_type' => ['sometimes', 'in:credit,debit'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'payment_method' => ['sometimes', 'in:cash,upi,card,bank_transfer'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::beginTransaction();
        try {
            $payment->update($validated);

            $order = $payment->order()->first();
            if ($order) {
                $this->syncOrderFinancials($order);
            }

            DB::commit();

            $payment->load(['order', 'customer', 'branch']);

            return (new PaymentResource($payment))
                ->additional([
                    'success' => true,
                    'message' => 'Payment updated successfully.',
                ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified payment.
     */
    public function destroy(Payment $payment)
    {
        DB::beginTransaction();
        try {
            $order = $payment->order()->first();

            $payment->delete();

            if ($order) {
                $this->syncOrderFinancials($order);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Recalculate order/customer totals after payment mutations.
     */
    protected function syncOrderFinancials(Order $order): void
    {
        $order->refresh();
    }

    /**
     * Get payments by order.
     */
    public function getByOrder(Request $request, $orderId)
    {
        $query = Payment::where('order_id', $orderId)
            ->with(['customer', 'branch']);

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['payment_date', 'amount', 'payment_type', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        $paginator = $pagination['paginator'];
        $sortBy = $pagination['sortBy'];
        $sortDirection = $pagination['sortDirection'];

        return response()->json([
            'success' => true,
            'data' => PaymentResource::collection($paginator->items()),
            'meta' => $this->paginationMeta($paginator, $sortBy ?? 'created_at', $sortDirection ?? 'desc'),
        ]);
    }

    /**
     * Export payment receipt as PDF.
     */
    public function exportPdf(Payment $payment, PdfExportService $pdfService)
    {
        $payment->load([
            'order.items.package',
            'customer',
            'branch',
        ]);

        // Get business & invoice settings for PDF branding
        $settings = Setting::businessInfo([
            'invoice_business_name',
            'invoice_business_website',
            'invoice_business_address',
            'invoice_contact_phone',
            'invoice_contact_email',
            'invoice_footer_text',
            'business_logo',
        ]);

        // Get customer name safely
        $customer = $payment->customer;
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
        
        // Get payment ID
        $paymentId = $payment->id ?? 'Unknown';

        $data = [
            'payment' => $payment,
            'settings' => $settings,
            'exportDate' => now()->format('Y-m-d H:i:s'),
        ];

        $filename = "Payment_{$paymentId}_{$customerNameSafe}.pdf";

        return $pdfService->download('pdfs.transaction', $data, $filename);
    }

}
