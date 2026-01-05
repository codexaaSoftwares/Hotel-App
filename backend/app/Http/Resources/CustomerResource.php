<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
            'customerId' => $this->customer_code ?? '#CUST' . str_pad($this->id, 3, '0', STR_PAD_LEFT),
            'customer_code' => $this->customer_code,
            'job_code' => $this->job_code,
            'jobCode' => $this->job_code,
            'name' => trim($this->first_name . ' ' . ($this->last_name ?? '')),
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'email' => $this->email,
            'mobile' => $this->mobile ?? $this->phone,
            'phone' => $this->phone ?? $this->mobile,
            'address_line' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'address' => [
                'street' => $this->address,
                'city' => $this->city,
                'state' => $this->state,
                'postalCode' => $this->postal_code,
                'country' => $this->country,
            ],
            'location' => [
                'city' => $this->city,
                'country' => $this->country,
            ],
            'status' => $this->status,
            'branch_id' => $this->branch_id,
            'branch_name' => $this->branch?->branch_name,
            'branch_code' => $this->branch?->branch_code,
            'totalOrders' => $this->total_orders,
            'total_orders' => $this->total_orders,
            'totalSpent' => (float) $this->total_amount,
            'total_amount' => (float) $this->total_amount,
            'total_earnings' => (float) $this->total_amount,
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => (float) $this->remaining_amount,
            'wallet_balance' => (float) $this->wallet_balance,
            'joinedDate' => $this->created_at?->toISOString(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'dob' => $this->dob?->format('Y-m-d'),
            'anniversary_date' => $this->anniversary_date?->format('Y-m-d'),
            'notes' => $this->notes,
            'preferences' => $this->preferences,
        ];
    }
}
