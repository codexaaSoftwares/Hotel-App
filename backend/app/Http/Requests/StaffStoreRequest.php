<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StaffStoreRequest extends FormRequest
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
            'mobile' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
            'salaryType' => ['required', 'in:monthly,other'],
            'salaryAmount' => ['required', 'numeric', 'min:0'],
            'joiningDate' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'documentInfo' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
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
     * Get validated data with snake_case keys for database.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Convert camelCase to snake_case for database
        return [
            'name' => $validated['name'],
            'mobile' => $validated['mobile'] ?? null,
            'department' => $validated['department'] ?? null,
            'salary_type' => $validated['salaryType'],
            'salary_amount' => $validated['salaryAmount'],
            'joining_date' => $validated['joiningDate'] ?? null,
            'address' => $validated['address'] ?? null,
            'document_info' => $validated['documentInfo'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ];
    }
}
