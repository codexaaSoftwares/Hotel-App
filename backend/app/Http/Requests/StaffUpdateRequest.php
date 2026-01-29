<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StaffUpdateRequest extends FormRequest
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
            'mobile' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
            'salaryType' => ['sometimes', 'required', 'in:monthly,other'],
            'salaryAmount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'joiningDate' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'documentInfo' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
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
        $result = [];
        
        if (isset($validated['name'])) {
            $result['name'] = $validated['name'];
        }
        if (isset($validated['mobile'])) {
            $result['mobile'] = $validated['mobile'] ?: null;
        }
        if (isset($validated['department'])) {
            $result['department'] = $validated['department'] ?: null;
        }
        if (isset($validated['salaryType'])) {
            $result['salary_type'] = $validated['salaryType'];
        }
        if (isset($validated['salaryAmount'])) {
            $result['salary_amount'] = $validated['salaryAmount'];
        }
        if (isset($validated['joiningDate'])) {
            $result['joining_date'] = $validated['joiningDate'] ?: null;
        }
        if (isset($validated['address'])) {
            $result['address'] = $validated['address'] ?: null;
        }
        if (isset($validated['documentInfo'])) {
            $result['document_info'] = $validated['documentInfo'] ?: null;
        }
        if (isset($validated['status'])) {
            $result['status'] = $validated['status'];
        }

        return $result;
    }
}
