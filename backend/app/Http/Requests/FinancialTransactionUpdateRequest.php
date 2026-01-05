<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FinancialTransactionUpdateRequest extends FormRequest
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
        $transaction = $this->route('transaction');
        $transactionType = $transaction ? $transaction->transaction_type : $this->input('transaction_type');

        return [
            'transaction_date' => ['required', 'date', 'before_or_equal:today'],
            'category_id' => [
                'required',
                'exists:financial_categories,id',
                Rule::exists('financial_categories', 'id')->where(function ($query) use ($transactionType) {
                    return $query->where('type', $transactionType)
                        ->where('status', 'active')
                        ->whereNull('deleted_at');
                }),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string'],
            // transaction_type cannot be changed in update
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'category_id.exists' => 'The selected category does not exist or does not match the transaction type.',
            'transaction_date.before_or_equal' => 'Transaction date cannot be in the future.',
        ];
    }
}
