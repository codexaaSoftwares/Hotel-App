<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
|
| If the application is in maintenance / demo mode via the "down" command
| we will load this file so that any pre-rendered content can be shown
| instead of starting the framework, which could cause an exception.
|
*/

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/

require __DIR__.'/../vendor/autoload.php';

$adminPathPrefix = '/admin';

$requestUri = $_SERVER['REQUEST_URI'] ?? null;

// Handle storage files directly (bypass Laravel routing)
// This works without symlinks - serves directly from storage/app/public
if ($requestUri && str_starts_with($requestUri, $adminPathPrefix . '/api/storage/')) {
    // Extract the storage path (remove /admin/api/storage/)
    $storagePath = substr($requestUri, strlen($adminPathPrefix . '/api/storage/'));
    
    // Build the full file path - point directly to storage/app/public (no symlink needed)
    $filePath = __DIR__ . '/../storage/app/public/' . $storagePath;
    
    // Check if file exists
    if (file_exists($filePath) && is_file($filePath)) {
        // Get MIME type
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
        
        // Set headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
        header('Access-Control-Allow-Origin: *'); // Allow CORS if needed
        
        // Output file
        readfile($filePath);
        exit;
    } else {
        // File not found
        http_response_code(404);
        header('Content-Type: text/plain');
        echo 'File not found: ' . htmlspecialchars($storagePath);
        exit;
    }
}

// Process API routes through Laravel (strip /admin prefix)
if ($requestUri && str_starts_with($requestUri, $adminPathPrefix . '/api')) {
    $_SERVER['REQUEST_URI'] = substr($requestUri, strlen($adminPathPrefix));

    if (!empty($_SERVER['PATH_INFO']) && str_starts_with($_SERVER['PATH_INFO'], $adminPathPrefix)) {
        $_SERVER['PATH_INFO'] = substr($_SERVER['PATH_INFO'], strlen($adminPathPrefix));
    }

    if (!empty($_SERVER['ORIG_PATH_INFO']) && str_starts_with($_SERVER['ORIG_PATH_INFO'], $adminPathPrefix)) {
        $_SERVER['ORIG_PATH_INFO'] = substr($_SERVER['ORIG_PATH_INFO'], strlen($adminPathPrefix));
    }
}

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);

