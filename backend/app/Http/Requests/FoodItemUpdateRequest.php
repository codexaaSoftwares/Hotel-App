<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FoodItemUpdateRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'food_category_id' => ['sometimes', 'required', 'integer', 'exists:food_categories,id'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'food_type' => ['nullable', 'in:veg,non_veg'],
            'status' => ['nullable', 'in:active,inactive'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'string', 'max:255'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_popular' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     * Convert empty string to null for nullable fields.
     *
     * @return void
     */
}

