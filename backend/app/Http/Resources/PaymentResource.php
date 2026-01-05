<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'paymentNumber' => $this->payment_number,
            'orderId' => $this->order_id,
            'order' => $this->whenLoaded('order', function () {
                if (!$this->order) {
                    return null;
                }

                return [
                    'id' => $this->order->id,
                    'orderNumber' => $this->order->order_number,
                    'totalAmount' => (float) $this->order->total_amount,
                    'paidAmount' => (float) $this->order->paid_amount,
                    'remainingAmount' => (float) $this->order->remaining_amount,
                    'paymentStatus' => $this->order->payment_status,
                ];
            }),
            'customerId' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', function () {
                if (!$this->customer) {
                    return null;
                }
                return [
                    'id' => $this->customer->id,
                    'firstName' => $this->customer->first_name,
                    'lastName' => $this->customer->last_name,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                    'customerCode' => $this->customer->customer_code,
                ];
            }),
            'branchId' => $this->branch_id,
            'branch' => $this->whenLoaded('branch', function () {
                if (!$this->branch) {
                    return null;
                }
                return [
                    'id' => $this->branch->id,
                    'branchName' => $this->branch->branch_name,
                    'branchCode' => $this->branch->branch_code,
                ];
            }),
            'paymentDate' => $this->payment_date?->format('Y-m-d'),
            'paymentType' => $this->payment_type,
            'amount' => (float) $this->amount,
            'paymentMethod' => $this->payment_method,
            'remarks' => $this->remarks,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
