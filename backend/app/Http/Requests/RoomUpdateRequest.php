<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomUpdateRequest extends FormRequest
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
        $room = $this->route('room');
        $roomId = $room instanceof \App\Models\Room ? $room->id : $room;

        return [
            'room_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('rooms', 'room_number')->ignore($roomId)],
            'room_category_id' => ['sometimes', 'required', 'integer', 'exists:room_categories,id'],
            'floor_number' => ['sometimes', 'required', 'integer', 'min:0', 'max:100'],
            'bed_type' => ['sometimes', 'required', 'in:single,double,king,queen,twin'],
            'max_occupancy' => ['sometimes', 'required', 'integer', 'min:1', 'max:20'],
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
            'room_price' => $this->input('room_price') === '' ? null : $this->input('room_price'),
        ]);
    }
}

