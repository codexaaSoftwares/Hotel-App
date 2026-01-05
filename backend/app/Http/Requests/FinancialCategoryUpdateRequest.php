<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinancialCategoryUpdateRequest extends FormRequest
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
        $categoryId = $this->route('category')->id ?? null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
            // Type cannot be changed in update
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
        ]);
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $category = $this->route('category');
            if (!$category) {
                return;
            }

            // Check if category name is unique for the given type (excluding current category)
            $existingCategory = \App\Models\FinancialCategory::where('type', $category->type)
                ->where('name', $this->input('name'))
                ->where('id', '!=', $category->id)
                ->whereNull('deleted_at')
                ->first();

            if ($existingCategory) {
                $validator->errors()->add('name', 'A category with this name already exists for this type.');
            }
        });
    }
}
