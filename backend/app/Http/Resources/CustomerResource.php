<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
            'customerCode' => $this->customer_code,
            'name' => $this->name,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'pincode' => $this->pincode,
            'customerType' => $this->customer_type,
            'totalBills' => (int) $this->total_bills,
            'totalAmount' => (float) $this->total_amount,
            'paidAmount' => (float) $this->paid_amount,
            'remainingAmount' => (float) $this->remaining_amount,
            'status' => $this->status,
            'notes' => $this->notes,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}

