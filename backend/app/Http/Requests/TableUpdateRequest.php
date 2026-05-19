<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TableUpdateRequest extends FormRequest
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
        $table = $this->route('table');
        $tableId = $table instanceof \App\Models\Table ? $table->id : $table;

        return [
            'table_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('tables', 'table_number')->ignore($tableId)],
            'table_name' => ['nullable', 'string', 'max:255'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1', 'max:50'],
            'status' => ['nullable', 'in:available,occupied,reserved,cleaning,maintenance'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}

