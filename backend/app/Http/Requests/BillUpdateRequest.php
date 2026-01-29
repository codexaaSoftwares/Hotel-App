<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BillUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'table_id' => ['nullable', 'exists:tables,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'bill_date' => ['sometimes', 'date'],
            'status' => ['nullable', 'in:draft,pending,paid,cancelled'],
            'payment_status' => ['nullable', 'in:pending,partial,paid'],
            'subtotal' => ['sometimes', 'numeric', 'min:0'],
            'gst_amount' => ['nullable', 'numeric', 'min:0'],
            'cgst_amount' => ['nullable', 'numeric', 'min:0'],
            'sgst_amount' => ['nullable', 'numeric', 'min:0'],
            'service_tax_amount' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['sometimes', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'remaining_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'in:cash,upi,card,split'],
            'gst_calculation_method' => ['nullable', 'in:item_wise,bill_wise'],
            'notes' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.food_item_id' => ['required_with:items', 'exists:food_items,id'],
            'items.*.item_name' => ['required_with:items', 'string', 'max:255'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.gst_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.gst_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.total_price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.display_order' => ['nullable', 'integer', 'min:0'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Convert empty strings to null for nullable fields.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Convert empty strings to null for nullable fields
        $nullableFields = ['table_id', 'customer_id', 'payment_method', 'notes'];
        foreach ($nullableFields as $field) {
            if (isset($validated[$field]) && $validated[$field] === '') {
                $validated[$field] = null;
            }
        }

        // Handle items array nullable fields
        if (isset($validated['items']) && is_array($validated['items'])) {
            foreach ($validated['items'] as $key => $item) {
                $itemNullableFields = ['gst_percentage', 'gst_amount', 'display_order', 'notes'];
                foreach ($itemNullableFields as $field) {
                    if (isset($item[$field]) && $item[$field] === '') {
                        $validated['items'][$key][$field] = null;
                    }
                }
            }
        }

        return $validated;
    }
}

