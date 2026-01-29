<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SalaryPaymentResource extends JsonResource
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
            'staffId' => $this->staff_id,
            'staff' => $this->whenLoaded('staff', function () {
                return new StaffResource($this->staff);
            }),
            'month' => $this->month,
            'year' => $this->year,
            'paidAmount' => (float) $this->paid_amount,
            'paymentDate' => $this->payment_date->format('Y-m-d'),
            'paymentMethod' => $this->payment_method,
            'referenceNumber' => $this->reference_number,
            'notes' => $this->notes,
            'createdBy' => $this->created_by,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
