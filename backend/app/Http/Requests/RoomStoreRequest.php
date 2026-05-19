<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoomStoreRequest extends FormRequest
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
            'room_number' => ['required', 'string', 'max:50', 'unique:rooms,room_number'],
            'room_category_id' => ['required', 'integer', 'exists:room_categories,id'],
            'floor_number' => ['required', 'integer', 'min:0', 'max:100'],
            'bed_type' => ['required', 'in:single,double,king,queen,twin'],
            'max_occupancy' => ['required', 'integer', 'min:1', 'max:20'],
            'room_price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:available,occupied,cleaning,maintenance,reserved'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
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
            'status' => $this->input('status', 'available'),
            'is_active' => $this->input('is_active', true),
            'room_price' => $this->input('room_price') === '' ? null : $this->input('room_price'),
        ]);
    }
}

