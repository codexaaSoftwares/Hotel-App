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
        $imageUrl = null;
        if ($this->image) {
            $appUrl = rtrim(config('app.url'), '/');
            $parsedUrl = parse_url($appUrl);
            $scheme = $parsedUrl['scheme'] ?? 'http';
            $host = $parsedUrl['host'] ?? 'localhost';
            $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
            
            // Build domain with port
            $domain = $scheme . '://' . $host . $port;
            
            // Storage files are always served at /admin/api/storage/ (as configured in public/index.php)
            $imageUrl = $domain . '/admin/api/storage/' . $this->image;
        }

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
            'image' => $imageUrl,
            'display_order' => (int) $this->display_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

