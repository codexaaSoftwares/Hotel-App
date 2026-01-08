<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FoodItemStoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'food_category_id' => ['required', 'integer', 'exists:food_categories,id'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'gst_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
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
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'status' => $this->input('status', 'active'),
            'food_type' => $this->input('food_type', 'veg'),
            // Don't set default for gst_percentage - allow null to use default GST from settings
            'gst_percentage' => $this->input('gst_percentage') === '' ? null : $this->input('gst_percentage'),
            'is_popular' => $this->input('is_popular', false),
        ]);
    }
}

