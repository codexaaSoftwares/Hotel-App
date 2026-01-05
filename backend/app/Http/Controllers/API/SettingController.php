<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Get all settings or by group.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return $this->listAll($request);
    }

    /**
     * Update settings by group.
     *
     * @param Request $request
     * @param string $group
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateGroup(Request $request, $group)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::set($key, $value, $group);
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }


    /**
     * Test email configuration.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function testEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|max:255',
            ]);

            $result = $this->emailService->sendEmailImmediately(
                $validated['email'],
                'test',
                [
                    'message' => 'This is a test email from ' . config('app.name'),
                    'timestamp' => now()->toDateTimeString(),
                ]
            );

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Test email sent successfully to ' . $validated['email']
                ]);
            }

            // If result is false, check the logs for the actual error
            // The error should already be logged in EmailService
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email. Please check your email configuration and ensure SMTP Host is a valid hostname (not an email address). Check Laravel logs for details.'
            ], 500);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Test email error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            // Return user-friendly error message
            $errorMessage = $e->getMessage();
            
            // Provide helpful message for common SMTP host issues
            if (strpos($errorMessage, 'SMTP Host cannot be an email address') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage
                ], 422);
            }
            
            return response()->json([
                'success' => false,
                'message' => $errorMessage ?: 'Failed to send test email. Please check your email configuration.'
            ], 500);
        }
    }

    /**
     * Upload business logo.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadLogo(Request $request)
    {
        try {
            $validated = $request->validate([
                'logo' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // 2MB max
            ]);

            // Delete old logo if exists
            $oldLogo = Setting::where('key', 'business_logo')
                ->where('group', 'Business Information')
                ->first();
            
            if ($oldLogo && $oldLogo->value) {
                $oldPath = storage_path('app/public/' . $oldLogo->value);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Store new logo
            $file = $request->file('logo');
            $filename = 'business_logo_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/logos', $filename);
            
            // Get relative path for storage (without 'public/' prefix)
            $relativePath = 'logos/' . $filename;

            // Save to settings
            Setting::set('business_logo', $relativePath, 'Business Information');

            // Return full URL for frontend
            // Generate storage URL with correct backend path
            $logoUrl = $this->getStorageUrl($relativePath);

            return response()->json([
                'success' => true,
                'message' => 'Logo uploaded successfully',
                'data' => [
                    'path' => $relativePath,
                    'url' => $logoUrl,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Logo upload error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload logo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete business logo.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteLogo()
    {
        try {
            // Find the logo setting
            $logoSetting = Setting::where('key', 'business_logo')
                ->where('group', 'Business Information')
                ->first();
            
            if ($logoSetting && $logoSetting->value) {
                // Delete the logo file from storage
                $logoPath = storage_path('app/public/' . $logoSetting->value);
                if (file_exists($logoPath)) {
                    @unlink($logoPath);
                }
            }

            // Delete the setting from database
            if ($logoSetting) {
                $logoSetting->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logo deleted successfully',
            ]);
        } catch (\Exception $e) {
            \Log::error('Logo deletion error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete logo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all settings with optional section filter.
     */
    public function listAll(Request $request)
    {
        $query = Setting::query();

        if ($request->filled('section')) {
            $query->where('group', $request->input('section'));
        }

        if ($request->filled('sections')) {
            $sections = array_filter((array) $request->input('sections'));
            if (!empty($sections)) {
                $query->whereIn('group', $sections);
            }
        }

        $settings = $query
            ->orderBy('group')
            ->orderBy('key')
            ->get()
            ->map(fn (Setting $setting) => $this->formatSetting($setting));

        return response()->json($settings);
    }

    /**
     * Return settings grouped by section.
     */
    public function listBySection()
    {
        $grouped = Setting::query()
            ->orderBy('group')
            ->orderBy('key')
            ->get()
            ->groupBy('group')
            ->map(function ($settings, $group) {
                return [
                    'section' => $group,
                    'settings' => $settings
                        ->map(fn (Setting $setting) => $this->formatSetting($setting))
                        ->values(),
                ];
            })
            ->values();

        return response()->json($grouped);
    }

    /**
     * Return all settings within a specific section.
     */
    public function getSection(string $section)
    {
        $settings = Setting::where('group', $section)
            ->orderBy('key')
            ->get();

        if ($settings->isEmpty()) {
            return response()->json([
                'message' => 'Section not found',
            ], 404);
        }

        return response()->json([
            'section' => $section,
            'settings' => $settings
                ->map(fn (Setting $setting) => $this->formatSetting($setting))
                ->values(),
        ]);
    }


    /**
     * Store a newly created setting.
     */
    public function store(Request $request)
    {
        $section = $request->input('section', 'general');

        $validated = $request->validate([
            'key' => [
                'required',
                'string',
                'max:255',
                Rule::unique('settings')->where(fn ($query) => $query->where('group', $section)),
            ],
            'value' => 'nullable',
            'section' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $setting = Setting::create([
            'key' => $validated['key'],
            'value' => $this->normalizeValue($validated['value'] ?? null),
            'group' => $section,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json($this->formatSetting($setting), 201);
    }

    /**
     * Display the specified setting.
     */
    public function show(Setting $setting)
    {
        return response()->json($this->formatSetting($setting));
    }

    /**
     * Display a setting by key (optional section filter).
     */
    public function showByKey(Request $request, string $key)
    {
        $section = $request->input('section');

        $query = Setting::where('key', $key);

        if ($section) {
            $query->where('group', $section);
        }

        $setting = $query->first();

        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return response()->json($this->formatSetting($setting));
    }

    /**
     * Update the specified setting.
     */
    public function update(Request $request, Setting $setting)
    {
        $section = $request->input('section', $setting->group);

        $validated = $request->validate([
            'key' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('settings')->ignore($setting->id)->where(fn ($query) => $query->where('group', $section)),
            ],
            'value' => 'nullable',
            'section' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        if (isset($validated['key'])) {
            $setting->key = $validated['key'];
        }

        if (array_key_exists('value', $validated)) {
            $setting->value = $this->normalizeValue($validated['value']);
        }

        if (isset($validated['section'])) {
            $setting->group = $validated['section'];
        } elseif ($section !== $setting->group) {
            $setting->group = $section;
        }

        if (array_key_exists('description', $validated)) {
            $setting->description = $validated['description'];
        }

        $setting->save();

        return response()->json($this->formatSetting($setting));
    }

    /**
     * Update a setting by key (optionally scoped by section).
     */
    public function updateByKey(Request $request, string $key)
    {
        $section = $request->input('section');

        $query = Setting::where('key', $key);

        if ($section) {
            $query->where('group', $section);
        }

        $setting = $query->first();

        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return $this->update($request, $setting);
    }

    /**
     * Remove the specified setting.
     */
    public function destroy(Setting $setting)
    {
        $setting->delete();

        return response()->json(['message' => 'Setting deleted successfully']);
    }

    /**
     * Remove a setting by key (optionally scoped by section).
     */
    public function destroyByKey(Request $request, string $key)
    {
        $section = $request->input('section');

        $query = Setting::where('key', $key);

        if ($section) {
            $query->where('group', $section);
        }

        $setting = $query->first();

        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        $setting->delete();

        return response()->json(['message' => 'Setting deleted successfully']);
    }

    /**
     * Normalize values prior to persistence.
     */
    protected function normalizeValue($value): ?string
    {
        if (is_null($value)) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_array($value) || is_object($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }

    /**
     * Format a setting for API responses.
     */
    protected function formatSetting(Setting $setting): array
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
     * Generate storage URL with correct backend path.
     * Handles subdirectory installations like /admin/api
     *
     * @param string $relativePath Relative path from storage/app/public (e.g., 'logos/file.png')
     * @return string Full URL to the storage file
     */
    protected function getStorageUrl(string $relativePath): string
    {
        $appUrl = rtrim(config('app.url'), '/');
        
        // Extract domain from APP_URL
        $parsedUrl = parse_url($appUrl);
        $domain = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? 'lvclicks.in');
        
        // Check if APP_URL includes /api
        if (str_contains($appUrl, '/api')) {
            return $appUrl . '/storage/' . $relativePath;
        }
        
        // If APP_URL ends with /admin, add /api before /storage
        if (str_ends_with($appUrl, '/admin')) {
            return $domain . '/admin/api/storage/' . $relativePath;
        }
        
        // If APP_URL contains /admin but doesn't end with it, check path
        if (str_contains($appUrl, '/admin')) {
            // Extract path from APP_URL
            $path = $parsedUrl['path'] ?? '';
            // If path is /admin, add /api
            if ($path === '/admin') {
                return $domain . '/admin/api/storage/' . $relativePath;
            }
            // Otherwise use APP_URL as is
            return $appUrl . '/storage/' . $relativePath;
        }
        
        // Default: append /storage/ to APP_URL
        return $appUrl . '/storage/' . $relativePath;
    }

}

