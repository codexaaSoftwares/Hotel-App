<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
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
            'categoryId' => $this->category_id,
            'categoryName' => $this->category->name ?? null,
            'amount' => (float) $this->amount,
            'expenseDate' => $this->expense_date?->format('Y-m-d'),
            'paymentMethod' => $this->payment_method,
            'description' => $this->description,
            'createdBy' => $this->creator ? trim(($this->creator->first_name ?? '') . ' ' . ($this->creator->last_name ?? '')) : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

