<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WalletTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'customerId' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'customerCode' => $this->customer->customer_code,
                    'name' => $this->customer->name,
                ];
            }),
            'billId' => $this->bill_id,
            'bill' => $this->whenLoaded('bill', function () {
                if (!$this->bill) {
                    return null;
                }
                return [
                    'id' => $this->bill->id,
                    'billNumber' => $this->bill->bill_number ?? null,
                ];
            }),
            'runningBalance' => $this->when(isset($this->running_balance), function () {
                return (float) $this->running_balance;
            }),
            'transactionType' => $this->transaction_type,
            'amount' => (float) $this->amount,
            'paymentMethod' => $this->payment_method,
            'transactionDate' => $this->transaction_date?->format('Y-m-d H:i:s'),
            'description' => $this->description,
            'referenceNumber' => $this->reference_number,
            'createdBy' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'name' => $this->createdBy->first_name . ' ' . $this->createdBy->last_name,
                ];
            }),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}

