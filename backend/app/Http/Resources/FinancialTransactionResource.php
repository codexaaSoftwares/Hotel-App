<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FinancialTransactionResource extends JsonResource
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
            'transactionNumber' => $this->transaction_number,
            'transactionType' => $this->transaction_type,
            'transactionDate' => $this->transaction_date?->format('Y-m-d'),
            'categoryId' => $this->category_id,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'type' => $this->category->type,
                ];
            }),
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'createdBy' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'firstName' => $this->createdBy->first_name ?? null,
                    'lastName' => $this->createdBy->last_name ?? null,
                    'name' => ($this->createdBy->first_name ?? '') . ' ' . ($this->createdBy->last_name ?? ''),
                ];
            }),
            'createdById' => $this->created_by,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
