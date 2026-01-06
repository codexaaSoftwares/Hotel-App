<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FoodItemResource extends JsonResource
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
            'name' => $this->name,
            'food_category_id' => $this->food_category_id,
            'food_category' => $this->whenLoaded('foodCategory', function () {
                return [
                    'id' => $this->foodCategory->id,
                    'name' => $this->foodCategory->name,
                ];
            }),
            'price' => (float) $this->price,
            'gst_percentage' => (float) $this->gst_percentage,
            'food_type' => $this->food_type,
            'status' => $this->status,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

