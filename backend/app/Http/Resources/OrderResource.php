<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'orderNumber' => $this->order_number,
            'customerId' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'firstName' => $this->customer->first_name,
                    'lastName' => $this->customer->last_name,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                    'phone' => $this->customer->phone ?? $this->customer->mobile,
                    'mobile' => $this->customer->mobile,
                    'customerCode' => $this->customer->customer_code,
                    'jobCode' => $this->customer->job_code,
                    'job_code' => $this->customer->job_code,
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
            'orderDate' => $this->order_date?->format('Y-m-d'),
            'dueDate' => $this->due_date?->format('Y-m-d'),
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'totalAmount' => (float) $this->total_amount,
            'paidAmount' => (float) $this->paid_amount,
            'remainingAmount' => (float) $this->remaining_amount,
            'status' => $this->status,
            'paymentStatus' => $this->payment_status,
            'paymentMethod' => $this->payment_method,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'notes' => $this->notes,
            'timeline' => $this->timeline,
            'links' => $this->links ?? [],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
