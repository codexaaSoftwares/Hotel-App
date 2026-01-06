<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RestaurantSettingsController extends Controller
{
    /**
     * List all restaurant settings with optional section filter.
     */
    public function index(Request $request)
    {
        $query = Setting::query()->whereIn('group', [
            'GST Settings',
            'Invoice Settings',
            'Thermal Printer'
        ]);

        if ($request->filled('section')) {
            $query->where('group', $request->input('section'));
        }

        $settings = $query
            ->orderBy('group')
            ->orderBy('key')
            ->get()
            ->map(fn (Setting $setting) => $this->formatSetting($setting));

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Return restaurant settings grouped by section.
     */
    public function listBySection()
    {
        $grouped = Setting::query()
            ->whereIn('group', [
                'GST Settings',
                'Invoice Settings',
                'Thermal Printer'
            ])
            ->orderBy('group')
            ->orderBy('key')
            ->get()
            ->groupBy('group')
            ->map(function ($settings, $group) {
                $settingsArray = $settings
                    ->map(fn (Setting $setting) => $this->formatSetting($setting))
                    ->keyBy('key')
                    ->map(fn ($item) => $item['value'])
                    ->toArray();

                return $settingsArray;
            })
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $grouped,
        ]);
    }

    /**
     * Return all settings within a specific section.
     */
    public function getSection(string $section)
    {
        $validSections = ['GST Settings', 'Invoice Settings', 'Thermal Printer'];
        
        if (!in_array($section, $validSections)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid section',
            ], 400);
        }

        $settings = Setting::where('group', $section)
            ->orderBy('key')
            ->get();

        if ($settings->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $settingsArray = $settings
            ->map(fn (Setting $setting) => $this->formatSetting($setting))
            ->keyBy('key')
            ->map(fn ($item) => $item['value'])
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $settingsArray,
        ]);
    }

    /**
     * Display a setting by key (optional section filter).
     */
    public function showByKey(Request $request, string $key)
    {
        $section = $request->input('section');

        $query = Setting::where('key', $key)
            ->whereIn('group', ['GST Settings', 'Invoice Settings', 'Thermal Printer']);

        if ($section) {
            $query->where('group', $section);
        }

        $setting = $query->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatSetting($setting),
        ]);
    }

    /**
     * Store a newly created restaurant setting.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => [
                'required',
                'string',
                'max:255',
            ],
            'value' => 'nullable',
            'section' => [
                'required',
                'string',
                'in:GST Settings,Invoice Settings,Thermal Printer',
            ],
            'type' => 'nullable|string|in:string,number,boolean',
        ]);

        $section = $validated['section'];
        $key = $validated['key'];
        $value = $this->normalizeValue($validated['value'] ?? null, $validated['type'] ?? 'string');

        // Use updateOrCreate to ensure the setting is saved
        $setting = Setting::updateOrCreate(
            [
                'key' => $key,
                'group' => $section,
            ],
            [
                'value' => $value,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $this->formatSetting($setting),
            'message' => 'Setting saved successfully',
        ], 201);
    }

    /**
     * Bulk update restaurant settings.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $validSections = ['GST Settings', 'Invoice Settings', 'Thermal Printer'];
        $settings = $validated['settings'];

        // Check if settings is an array of objects (from frontend) or object with sections (alternative format)
        if (isset($settings[0]) && is_array($settings[0]) && isset($settings[0]['key'])) {
            // Format: [{key: '...', value: '...', section: '...'}, ...]
            foreach ($settings as $settingData) {
                if (!isset($settingData['key']) || !isset($settingData['section'])) {
                    continue;
                }

                $section = $settingData['section'];
                $key = $settingData['key'];
                $value = $settingData['value'] ?? null;
                $type = $settingData['type'] ?? 'string';

                if (!in_array($section, $validSections)) {
                    continue; // Skip invalid sections
                }

                $normalizedValue = $this->normalizeValue($value, $type);

                // Use updateOrCreate to ensure the setting is saved
                Setting::updateOrCreate(
                    [
                        'key' => $key,
                        'group' => $section,
                    ],
                    [
                        'value' => $normalizedValue,
                    ]
                );
            }
        } else {
            // Format: {'GST Settings': {key: value, ...}, ...}
            foreach ($settings as $section => $sectionSettings) {
                if (!in_array($section, $validSections)) {
                    continue; // Skip invalid sections
                }

                if (!is_array($sectionSettings)) {
                    continue;
                }

                foreach ($sectionSettings as $key => $value) {
                    $setting = Setting::where('key', $key)
                        ->where('group', $section)
                        ->first();

                    if ($setting) {
                        $setting->value = $this->normalizeValue($value);
                        $setting->save();
                    } else {
                        Setting::create([
                            'key' => $key,
                            'value' => $this->normalizeValue($value),
                            'group' => $section,
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Format setting for API response.
     */
    private function formatSetting(Setting $setting): array
    {
        return [
            'id' => $setting->id,
            'key' => $setting->key,
            'value' => $setting->value,
            'section' => $setting->group,
            'description' => $setting->description,
            'created_at' => $setting->created_at,
            'updated_at' => $setting->updated_at,
        ];
    }

    /**
     * Normalize value based on type.
     */
    private function normalizeValue($value, string $type = 'string')
    {
        if ($value === null || $value === '') {
            return null;
        }

        switch ($type) {
            case 'number':
                return is_numeric($value) ? (float) $value : $value;
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            default:
                return (string) $value;
        }
    }
}

