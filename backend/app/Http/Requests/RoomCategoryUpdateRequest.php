<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomCategoryUpdateRequest extends FormRequest
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
        $roomCategory = $this->route('roomCategory');
        $roomCategoryId = $roomCategory instanceof \App\Models\RoomCategory ? $roomCategory->id : $roomCategory;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('room_categories', 'name')->ignore($roomCategoryId)],
            'description' => ['nullable', 'string'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'max_adults' => ['sometimes', 'required', 'integer', 'min:1', 'max:10'],
            'max_children' => ['sometimes', 'required', 'integer', 'min:0', 'max:10'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }
}

