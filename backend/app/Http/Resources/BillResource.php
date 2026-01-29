<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
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
            'billNumber' => $this->bill_number,
            'tableId' => $this->table_id,
            'table' => $this->whenLoaded('table', function () {
                return [
                    'id' => $this->table->id,
                    'tableNumber' => $this->table->table_number,
                    'tableName' => $this->table->table_name,
                    'capacity' => $this->table->capacity,
                    'status' => $this->table->status,
                ];
            }),
            'customerId' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'customerCode' => $this->customer->customer_code,
                    'name' => $this->customer->name,
                    'mobile' => $this->customer->mobile,
                    'email' => $this->customer->email,
                    'customerType' => $this->customer->customer_type,
                ];
            }),
            'billDate' => $this->bill_date,
            'status' => $this->status,
            'paymentStatus' => $this->payment_status,
            'subtotal' => (float) $this->subtotal,
            'gstAmount' => (float) $this->gst_amount,
            'cgstAmount' => (float) $this->cgst_amount,
            'sgstAmount' => (float) $this->sgst_amount,
            'serviceTaxAmount' => (float) $this->service_tax_amount,
            'discount' => (float) $this->discount,
            'totalAmount' => (float) $this->total_amount,
            'paidAmount' => (float) $this->paid_amount,
            'remainingAmount' => (float) $this->remaining_amount,
            'paymentMethod' => $this->payment_method,
            'gstCalculationMethod' => $this->gst_calculation_method,
            'notes' => $this->notes,
            'createdBy' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'items' => BillItemResource::collection($this->whenLoaded('billItems')),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}

