<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\WalletTransactionStoreRequest;
use App\Http\Requests\WalletTransactionUpdateRequest;
use App\Http\Resources\WalletTransactionResource;
use App\Models\Customer;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class WalletTransactionController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of wallet transactions.
     */
    public function index(Request $request)
    {
        $query = WalletTransaction::with(['customer', 'bill', 'createdBy']);

        // Filter by customer
        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        // Filter by transaction type
        if ($transactionType = $request->input('transaction_type')) {
            $query->where('transaction_type', $transactionType);
        }

        // Filter by payment method
        if ($paymentMethod = $request->input('payment_method')) {
            $query->where('payment_method', $paymentMethod);
        }

        // Filter by date range
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('transaction_date', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('transaction_date', '<=', $endDate);
        }

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%");
                    });
            });
        }

        $sortableColumns = ['transaction_date', 'amount', 'transaction_type', 'created_at'];
        $defaultSort = ['column' => 'transaction_date', 'direction' => 'desc'];

        $result = $this->buildPaginator(
            $request,
            $query,
            $sortableColumns,
            $defaultSort
        );
        $paginator = $result['paginator'];
        $sortBy = $result['sortBy'];
        $sortDirection = $result['sortDirection'];

        return response()->json([
            'success' => true,
            'data' => WalletTransactionResource::collection($paginator->items()),
            'meta' => $this->paginationMeta($paginator, $sortBy, $sortDirection),
        ]);
    }

    /**
     * Get wallet transactions for a specific customer.
     */
    public function getByCustomer(Request $request, $customerId)
    {
        $customer = Customer::findOrFail($customerId);

        $query = WalletTransaction::with(['bill', 'createdBy'])
            ->where('customer_id', $customerId);

        // Filter by transaction type
        if ($transactionType = $request->input('transaction_type')) {
            $query->where('transaction_type', $transactionType);
        }

        // Filter by payment method
        if ($paymentMethod = $request->input('payment_method')) {
            $query->where('payment_method', $paymentMethod);
        }

        // Filter by date range
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('transaction_date', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('transaction_date', '<=', $endDate);
        }

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sortableColumns = ['transaction_date', 'amount', 'transaction_type', 'created_at'];
        $defaultSort = ['column' => 'transaction_date', 'direction' => 'desc'];

        $result = $this->buildPaginator(
            $request,
            $query,
            $sortableColumns,
            $defaultSort
        );
        $paginator = $result['paginator'];
        $sortBy = $result['sortBy'];
        $sortDirection = $result['sortDirection'];

        // Calculate running balance (from oldest to newest for accurate calculation)
        $allTransactions = WalletTransaction::where('customer_id', $customerId)
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $runningBalance = 0;
        $balanceMap = [];
        foreach ($allTransactions as $t) {
            if ($t->transaction_type === 'credit') {
                $runningBalance += $t->amount;
            } else {
                $runningBalance -= $t->amount;
            }
            $balanceMap[$t->id] = $runningBalance;
        }

        // Calculate totals from ALL transactions (not filtered/paginated)
        // These totals should be from all transactions regardless of filters
        $totalDebit = (float) WalletTransaction::where('customer_id', $customerId)
            ->where('transaction_type', 'debit')
            ->sum('amount');
        $totalCredit = (float) WalletTransaction::where('customer_id', $customerId)
            ->where('transaction_type', 'credit')
            ->sum('amount');
        $remainingAmount = $totalDebit - $totalCredit;

        // Attach running balance to paginated transactions
        $transactions = $paginator->items();
        $transactionsWithBalance = collect($transactions)->map(function ($transaction) use ($balanceMap) {
            $transaction->running_balance = $balanceMap[$transaction->id] ?? 0;
            return $transaction;
        });

        return response()->json([
            'success' => true,
            'data' => WalletTransactionResource::collection($transactionsWithBalance),
            'meta' => $this->paginationMeta($paginator, $sortBy, $sortDirection),
            'totals' => [
                'totalDebit' => $totalDebit,
                'totalCredit' => $totalCredit,
                'remainingAmount' => $remainingAmount,
            ],
            'customer' => [
                'id' => $customer->id,
                'customerCode' => $customer->customer_code,
                'name' => $customer->name,
            ],
        ]);
    }

    /**
     * Store a newly created wallet transaction.
     */
    public function store(WalletTransactionStoreRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = auth()->id();

        $transaction = WalletTransaction::create($validated);

        // Update customer paid_amount and remaining_amount
        $customer = Customer::findOrFail($validated['customer_id']);
        if ($validated['transaction_type'] === 'credit') {
            $customer->increment('paid_amount', $validated['amount']);
        } else {
            $customer->decrement('paid_amount', $validated['amount']);
        }
        $customer->remaining_amount = $customer->total_amount - $customer->paid_amount;
        $customer->save();

        return response()->json([
            'success' => true,
            'data' => new WalletTransactionResource($transaction->load(['customer', 'bill', 'createdBy'])),
            'message' => 'Wallet transaction created successfully.',
        ], 201);
    }

    /**
     * Display the specified wallet transaction.
     */
    public function show($id)
    {
        $transaction = WalletTransaction::with(['customer', 'bill', 'createdBy'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new WalletTransactionResource($transaction),
        ]);
    }

    /**
     * Update the specified wallet transaction.
     */
    public function update(WalletTransactionUpdateRequest $request, $id)
    {
        $transaction = WalletTransaction::findOrFail($id);
        $oldAmount = $transaction->amount;
        $oldType = $transaction->transaction_type;
        $customer = $transaction->customer;

        // Revert old transaction impact
        if ($oldType === 'credit') {
            $customer->decrement('paid_amount', $oldAmount);
        } else {
            $customer->increment('paid_amount', $oldAmount);
        }

        $validated = $request->validated();
        $transaction->update($validated);

        // Apply new transaction impact
        $newAmount = $validated['amount'] ?? $transaction->amount;
        $newType = $validated['transaction_type'] ?? $transaction->transaction_type;

        if ($newType === 'credit') {
            $customer->increment('paid_amount', $newAmount);
        } else {
            $customer->decrement('paid_amount', $newAmount);
        }

        $customer->remaining_amount = $customer->total_amount - $customer->paid_amount;
        $customer->save();

        return response()->json([
            'success' => true,
            'data' => new WalletTransactionResource($transaction->load(['customer', 'bill', 'createdBy'])),
            'message' => 'Wallet transaction updated successfully.',
        ]);
    }

    /**
     * Remove the specified wallet transaction.
     */
    public function destroy($id)
    {
        $transaction = WalletTransaction::findOrFail($id);
        $customer = $transaction->customer;

        // Revert transaction impact
        if ($transaction->transaction_type === 'credit') {
            $customer->decrement('paid_amount', $transaction->amount);
        } else {
            $customer->increment('paid_amount', $transaction->amount);
        }

        $customer->remaining_amount = $customer->total_amount - $customer->paid_amount;
        $customer->save();

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Wallet transaction deleted successfully.',
        ]);
    }
}

