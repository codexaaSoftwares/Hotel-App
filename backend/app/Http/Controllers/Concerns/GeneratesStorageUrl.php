<?php

namespace App\Http\Controllers\Concerns;

trait GeneratesStorageUrl
{
    /**
     * Generate storage URL with correct backend path.
     * Handles subdirectory installations like /admin/api
     * Storage files are always served at /admin/api/storage/ (as configured in public/index.php)
     *
     * @param string $relativePath Relative path from storage/app/public (e.g., 'avatars/file.png', 'logos/file.png', 'food-items/file.png')
     * @return string Full URL to the storage file
     */
    protected function getStorageUrl(string $relativePath): string
    {
        $appUrl = rtrim(config('app.url'), '/');
        
        // Extract domain and port from APP_URL
        $parsedUrl = parse_url($appUrl);
        $scheme = $parsedUrl['scheme'] ?? 'http';
        $host = $parsedUrl['host'] ?? 'localhost';
        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
        
        // Build domain with port
        $domain = $scheme . '://' . $host . $port;
        
        // Storage files are always served at /admin/api/storage/ (as configured in public/index.php)
        return $domain . '/admin/api/storage/' . $relativePath;
    }
}

