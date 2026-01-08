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
     * Convert empty string to null for nullable fields.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Convert empty string to null for gst_percentage
        if ($this->has('gst_percentage') && ($this->input('gst_percentage') === '' || $this->input('gst_percentage') === null)) {
            $this->merge([
                'gst_percentage' => null,
            ]);
        }
    }

    /**
     * Get validated data with null handling.
     * If gst_percentage is null, exclude it from update so database keeps existing value.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        // If gst_percentage is null or empty, don't include it in update
        // This allows the database to keep the existing value or use default
        if (isset($validated['gst_percentage']) && ($validated['gst_percentage'] === null || $validated['gst_percentage'] === '')) {
            unset($validated['gst_percentage']);
        }
        
        return $validated;
    }
}

