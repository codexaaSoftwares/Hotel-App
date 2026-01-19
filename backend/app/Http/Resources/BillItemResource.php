<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BillItemResource extends JsonResource
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
            'billId' => $this->bill_id,
            'foodItemId' => $this->food_item_id,
            'itemName' => $this->item_name,
            'quantity' => (int) $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'gstPercentage' => $this->gst_percentage ? (float) $this->gst_percentage : null,
            'gstAmount' => (float) $this->gst_amount,
            'totalPrice' => (float) $this->total_price,
            'displayOrder' => (int) $this->display_order,
            'notes' => $this->notes,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}

