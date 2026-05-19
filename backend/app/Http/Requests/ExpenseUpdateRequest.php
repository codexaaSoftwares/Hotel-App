<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseUpdateRequest extends FormRequest
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
            'categoryId' => ['required_without:category_id', 'integer', 'exists:expense_categories,id'],
            'category_id' => ['required_without:categoryId', 'integer', 'exists:expense_categories,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expenseDate' => ['required_without:expense_date', 'date'],
            'expense_date' => ['required_without:expenseDate', 'date'],
            'paymentMethod' => ['required_without:payment_method', 'in:cash,upi,bank'],
            'payment_method' => ['required_without:paymentMethod', 'in:cash,upi,bank'],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'category_id' => $this->categoryId ?? $this->category_id ?? $this->input('categoryId'),
            'amount' => $this->amount ?? $this->input('amount'),
            'expense_date' => $this->expenseDate ?? $this->expense_date ?? $this->input('expenseDate'),
            'payment_method' => $this->paymentMethod ?? $this->payment_method ?? $this->input('paymentMethod'),
            'description' => $this->description ?? $this->input('description'),
        ]);
    }


    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'categoryId.required_without' => 'Category is required.',
            'category_id.required_without' => 'Category is required.',
            'categoryId.exists' => 'Selected category does not exist.',
            'category_id.exists' => 'Selected category does not exist.',
            'amount.required' => 'Amount is required.',
            'amount.min' => 'Amount must be greater than 0.',
            'expenseDate.required_without' => 'Expense date is required.',
            'expense_date.required_without' => 'Expense date is required.',
            'expenseDate.date' => 'Expense date must be a valid date.',
            'expense_date.date' => 'Expense date must be a valid date.',
            'paymentMethod.required_without' => 'Payment method is required.',
            'payment_method.required_without' => 'Payment method is required.',
            'paymentMethod.in' => 'Payment method must be cash, upi, or bank.',
            'payment_method.in' => 'Payment method must be cash, upi, or bank.',
        ];
    }
}

