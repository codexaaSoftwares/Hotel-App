<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SalaryPaymentStoreRequest extends FormRequest
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
            'staffId' => ['required', 'exists:staff,id'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'paidAmount' => ['required', 'numeric', 'min:0'],
            'paymentDate' => ['required', 'date'],
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
        return [
            'staff_id' => $validated['staffId'],
            'month' => $validated['month'],
            'year' => $validated['year'],
            'paid_amount' => $validated['paidAmount'],
            'payment_date' => $validated['paymentDate'],
            'payment_method' => $validated['paymentMethod'] ?? null,
            'reference_number' => $validated['referenceNumber'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
        ];
    }
}
