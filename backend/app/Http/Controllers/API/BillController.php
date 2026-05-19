<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\BillStoreRequest;
use App\Http\Requests\BillUpdateRequest;
use App\Http\Requests\ProcessPaymentRequest;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Customer;
use App\Models\Table;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    use PaginatesResults;

    /**
     * Update table status based on active bills.
     * Sets table to 'occupied' if it has active bills, 'available' if not.
     *
     * @param int|null $tableId
     * @return void
     */
    private function updateTableStatus($tableId)
    {
        if (!$tableId) {
            return; // No table associated
        }

        $table = Table::find($tableId);
        if (!$table) {
            return; // Table not found
        }

        // Skip if table is in maintenance or cleaning
        if (in_array($table->status, ['maintenance', 'cleaning'])) {
            return; // Don't change status for maintenance/cleaning tables
        }

        // Check if table has any active bills (draft or pending)
        $activeBillsCount = Bill::where('table_id', $tableId)
            ->whereIn('status', ['draft', 'pending'])
            ->count();

        // Update table status
        if ($activeBillsCount > 0) {
            // Table has active bills, set to occupied
            if ($table->status !== 'occupied') {
                $table->update(['status' => 'occupied']);
            }
        } else {
            // No active bills, set to available (only if currently occupied)
            if ($table->status === 'occupied') {
                $table->update(['status' => 'available']);
            }
        }
    }

    /**
     * Display a listing of bills.
     */
    public function index(Request $request)
    {
        $query = Bill::with(['table', 'customer', 'creator']);

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('bill_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%");
                    })
                    ->orWhereHas('table', function ($q) use ($search) {
                        $q->where('table_name', 'like', "%{$search}%")
                            ->orWhere('table_number', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Payment status filter
        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        // Payment method filter
        if ($request->has('payment_method') && $request->input('payment_method')) {
            $paymentMethod = $request->input('payment_method');
            $query->where('payment_method', $paymentMethod);
        }

        // Table filter
        if ($tableId = $request->input('table_id')) {
            $query->where('table_id', $tableId);
        }

        // Customer filter
        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('bill_date', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('bill_date', '<=', $endDate);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['bill_number', 'bill_date', 'status', 'payment_status', 'total_amount', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $bills = array_map(
            fn (Bill $bill) => (new BillResource($bill->load('billItems')))->toArray($request),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $bills,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created bill.
     */
    public function store(BillStoreRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $items = $validated['items'];
            unset($validated['items']);

            // Set created_by if not provided
            if (!isset($validated['created_by'])) {
                $validated['created_by'] = Auth::id();
            }

            // Calculate remaining amount if not provided
            if (!isset($validated['remaining_amount'])) {
                $validated['remaining_amount'] = $validated['total_amount'] - ($validated['paid_amount'] ?? 0);
            }

            // Ensure separate GST fields have default values
            $validated['cgst_amount'] = $validated['cgst_amount'] ?? 0;
            $validated['sgst_amount'] = $validated['sgst_amount'] ?? 0;
            $validated['service_tax_amount'] = $validated['service_tax_amount'] ?? 0;

            // Create bill first (bill_number will be generated after creation)
            $bill = Bill::create($validated);

            // Generate bill number based on bill ID and update
            $bill->bill_number = Bill::generateBillNumber($bill->id);
            $bill->save();

            // Create bill items
            foreach ($items as $index => $item) {
                $item['bill_id'] = $bill->id;
                $item['display_order'] = $item['display_order'] ?? $index;
                BillItem::create($item);
            }

            // Update table status to 'occupied' if bill is draft/pending
            if (in_array($bill->status, ['draft', 'pending']) && $bill->table_id) {
                $this->updateTableStatus($bill->table_id);
            }

            DB::commit();

            $bill->load(['table', 'customer', 'billItems', 'creator']);

            return (new BillResource($bill))
                ->additional([
                    'success' => true,
                    'message' => 'Bill created successfully.',
                ])
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create bill: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified bill.
     */
    public function show(Bill $bill)
    {
        $bill->load(['table', 'customer', 'billItems', 'creator']);

        return (new BillResource($bill))
            ->additional([
                'success' => true,
                'message' => 'Bill retrieved successfully.',
            ]);
    }

    /**
     * Update the specified bill.
     */
    public function update(BillUpdateRequest $request, Bill $bill)
    {
        // Prevent updating paid bills
        if ($bill->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update a paid bill.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $items = $validated['items'] ?? null;
            unset($validated['items']);

            // Calculate remaining amount if total_amount or paid_amount changed
            if (isset($validated['total_amount']) || isset($validated['paid_amount'])) {
                $totalAmount = $validated['total_amount'] ?? $bill->total_amount;
                $paidAmount = $validated['paid_amount'] ?? $bill->paid_amount;
                $validated['remaining_amount'] = $totalAmount - $paidAmount;
            }

            // Ensure separate GST fields have default values if updating
            if (isset($validated['cgst_amount']) || isset($validated['sgst_amount']) || isset($validated['service_tax_amount'])) {
                $validated['cgst_amount'] = $validated['cgst_amount'] ?? $bill->cgst_amount ?? 0;
                $validated['sgst_amount'] = $validated['sgst_amount'] ?? $bill->sgst_amount ?? 0;
                $validated['service_tax_amount'] = $validated['service_tax_amount'] ?? $bill->service_tax_amount ?? 0;
            }

            // Update bill
            $bill->update($validated);

            // Update bill items if provided
            if ($items !== null) {
                // Get all existing items (including soft deleted) and group by food_item_id
                $existingItemsByFoodId = $bill->billItems()->withTrashed()
                    ->get()
                    ->groupBy('food_item_id')
                    ->map(function ($group) {
                        // Get the first non-deleted item, or the first item if all are deleted
                        return $group->firstWhere('deleted_at', null) ?? $group->first();
                    });

                // Track which food_item_ids are in the new items
                $newFoodItemIds = collect($items)->pluck('food_item_id')->unique()->toArray();

                // Process each new item
                foreach ($items as $index => $item) {
                    $item['bill_id'] = $bill->id;
                    $item['display_order'] = $item['display_order'] ?? $index;
                    $foodItemId = $item['food_item_id'];

                    // Check if we have an existing item for this food_item_id
                    if (isset($existingItemsByFoodId[$foodItemId])) {
                        $existingItem = $existingItemsByFoodId[$foodItemId];
                        
                        // If soft deleted, restore it first
                        if ($existingItem->trashed()) {
                            $existingItem->restore();
                        }
                        
                        // Update the existing item
                        $existingItem->update($item);
                        
                        // Remove from map so we know it's been handled
                        unset($existingItemsByFoodId[$foodItemId]);
                    } else {
                        // Create new item (no existing item found for this food_item_id)
                        BillItem::create($item);
                    }
                }

                // Soft delete any remaining existing items that weren't in the new list
                foreach ($existingItemsByFoodId as $itemToDelete) {
                    if (!$itemToDelete->trashed()) {
                        $itemToDelete->delete();
                    }
                }
            }

            // Update table status if bill status or table_id changed
            $oldTableId = $bill->getOriginal('table_id');
            $newTableId = $bill->table_id;
            $oldStatus = $bill->getOriginal('status');
            $newStatus = $bill->status;

            // If table changed, update both old and new table status
            if ($oldTableId != $newTableId) {
                if ($oldTableId) {
                    $this->updateTableStatus($oldTableId);
                }
                if ($newTableId) {
                    $this->updateTableStatus($newTableId);
                }
            } elseif ($newTableId) {
                // Table didn't change, but status might have
                // Update table status if bill status changed to/from draft/pending
                if ($oldStatus !== $newStatus) {
                    $this->updateTableStatus($newTableId);
                }
            }

            DB::commit();

            $bill->load(['table', 'customer', 'billItems', 'creator']);

            return (new BillResource($bill))
                ->additional([
                    'success' => true,
                    'message' => 'Bill updated successfully.',
                ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bill: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified bill (hard delete).
     *
     * This is intentionally a hard delete (force delete) so that drafts or
     * in-progress bills created from the POS Panel can be completely removed
     * when a bill is cancelled. Paid bills are still protected.
     */
    public function destroy(Bill $bill)
    {
        // Prevent deleting paid bills
        if ($bill->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a paid bill.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $tableId = $bill->table_id;

            // Hard delete the bill. Related bill_items will be removed via
            // ON DELETE CASCADE and wallet_transactions will have bill_id
            // set to null as per foreign key configuration.
            $bill->forceDelete();

            // Update table status (bill deleted, table should become available if no other active bills)
            if ($tableId) {
                $this->updateTableStatus($tableId);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bill deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bill: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get bills for a specific table.
     */
    public function getByTable(Request $request, $tableId)
    {
        $table = Table::findOrFail($tableId);

        $query = Bill::with(['customer', 'billItems', 'creator'])
            ->where('table_id', $tableId);

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        } else {
            // Default: include draft and pending bills
            $includeDraft = $request->input('include_draft', true);
            if ($includeDraft) {
                $query->whereIn('status', ['draft', 'pending']);
            } else {
                $query->where('status', 'pending');
            }
        }

        // Order by created_at desc (newest first)
        $query->orderBy('created_at', 'desc');

        $bills = $query->get();

        return response()->json([
            'success' => true,
            'data' => BillResource::collection($bills),
            'meta' => [
                'table' => [
                    'id' => $table->id,
                    'tableNumber' => $table->table_number,
                    'tableName' => $table->table_name,
                    'capacity' => $table->capacity,
                    'status' => $table->status,
                ],
            ],
        ]);
    }

    /**
     * Process payment for a bill.
     */
    public function processPayment(ProcessPaymentRequest $request, Bill $bill)
    {
        // Validate bill status
        if ($bill->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Bill is already paid.',
            ], 422);
        }

        if ($bill->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot process payment for a cancelled bill.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $isWalletPayment = $validated['is_wallet_payment'] ?? false;
            $paymentMethod = $validated['payment_method'];
            $amount = $validated['amount'];

            // Validate amount
            if ($amount > $bill->remaining_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment amount cannot exceed remaining amount.',
                ], 422);
            }

            if ($isWalletPayment) {
                // Wallet payment: Create wallet transaction (debit) and mark bill as paid
                // Bill is considered paid from wallet, so status = paid, payment_status = paid
                if (!$bill->customer_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Customer is required for wallet payment.',
                    ], 422);
                }

                // Create wallet transaction (debit)
                $walletTransaction = WalletTransaction::create([
                    'customer_id' => $bill->customer_id,
                    'bill_id' => $bill->id,
                    'transaction_type' => 'debit',
                    'amount' => $bill->total_amount,
                    'payment_method' => null, // Wallet transactions don't have payment_method
                    'transaction_date' => now(),
                    'description' => $validated['payment_notes'] ?? "Bill sent to wallet - {$bill->bill_number}",
                    'reference_number' => $validated['reference_number'] ?? null,
                    'created_by' => Auth::id(),
                ]);

                // Update bill: status = paid, payment_status = paid (bill is considered paid from wallet)
                $bill->update([
                    'status' => 'paid',
                    'payment_status' => 'paid',
                    'paid_amount' => $bill->total_amount,
                    'remaining_amount' => 0,
                    'payment_method' => 'wallet', // Save 'wallet' as payment_method
                    'notes' => $validated['payment_notes'] ?? $bill->notes,
                ]);
            } else {
                // Regular payment (cash/upi/card): Update bill to paid
                $newPaidAmount = $bill->paid_amount + $amount;
                $newRemainingAmount = $bill->total_amount - $newPaidAmount;

                // Determine payment status
                $paymentStatus = 'paid';
                if ($newRemainingAmount > 0) {
                    $paymentStatus = 'partial';
                }

                // Update bill
                $bill->update([
                    'status' => 'paid',
                    'payment_status' => $paymentStatus,
                    'paid_amount' => $newPaidAmount,
                    'remaining_amount' => $newRemainingAmount,
                    'payment_method' => $paymentMethod,
                    'notes' => $validated['payment_notes'] ?? $bill->notes,
                ]);
            }

            // Update table status (bill is now paid, table should become available if no other active bills)
            if ($bill->table_id) {
                $this->updateTableStatus($bill->table_id);
            }

            DB::commit();

            $bill->load(['table', 'customer', 'billItems', 'creator']);

            return (new BillResource($bill))
                ->additional([
                    'success' => true,
                    'message' => $isWalletPayment 
                        ? 'Bill sent to customer wallet successfully.' 
                        : 'Payment processed successfully.',
                ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage(),
            ], 500);
        }
    }
}

