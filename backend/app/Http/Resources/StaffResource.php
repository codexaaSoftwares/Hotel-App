<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
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
            'staffCode' => 'STF' . $this->id,
            'name' => $this->name,
            'mobile' => $this->mobile,
            'department' => $this->department,
            'salaryType' => $this->salary_type,
            'salaryAmount' => (float) $this->salary_amount,
            'joiningDate' => $this->joining_date?->format('Y-m-d'),
            'address' => $this->address,
            'documentInfo' => $this->document_info,
            'status' => $this->status,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
