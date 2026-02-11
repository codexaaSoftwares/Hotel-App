<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'roomNumber' => $this->room_number,
            'roomCategoryId' => $this->room_category_id,
            'roomCategory' => $this->whenLoaded('roomCategory', function () {
                return [
                    'id' => $this->roomCategory->id,
                    'name' => $this->roomCategory->name,
                    'basePrice' => $this->roomCategory->base_price,
                ];
            }),
            'floorNumber' => $this->floor_number,
            'bedType' => $this->bed_type,
            'maxOccupancy' => $this->max_occupancy,
            'roomPrice' => $this->room_price,
            'effectivePrice' => $this->effective_price,
            'status' => $this->status,
            'notes' => $this->notes,
            'isActive' => $this->is_active,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}

