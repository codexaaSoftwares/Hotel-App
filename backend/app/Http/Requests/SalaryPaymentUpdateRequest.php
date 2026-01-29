<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SalaryPaymentUpdateRequest extends FormRequest
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
            'staffId' => ['sometimes', 'required', 'exists:staff,id'],
            'month' => ['sometimes', 'required', 'integer', 'min:1', 'max:12'],
            'year' => ['sometimes', 'required', 'integer', 'min:2000', 'max:2100'],
            'paidAmount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'paymentDate' => ['sometimes', 'required', 'date'],
            'paymentMethod' => ['nullable', 'string', 'max:50'],
            'referenceNumber' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
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
        
        if (isset($validated['staffId'])) {
            $result['staff_id'] = $validated['staffId'];
        }
        if (isset($validated['month'])) {
            $result['month'] = $validated['month'];
        }
        if (isset($validated['year'])) {
            $result['year'] = $validated['year'];
        }
        if (isset($validated['paidAmount'])) {
            $result['paid_amount'] = $validated['paidAmount'];
        }
        if (isset($validated['paymentDate'])) {
            $result['payment_date'] = $validated['paymentDate'];
        }
        if (isset($validated['paymentMethod'])) {
            $result['payment_method'] = $validated['paymentMethod'] ?: null;
        }
        if (isset($validated['referenceNumber'])) {
            $result['reference_number'] = $validated['referenceNumber'] ?: null;
        }
        if (isset($validated['notes'])) {
            $result['notes'] = $validated['notes'] ?: null;
        }

        return $result;
    }
}
