<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Setting;
use App\Services\EmailService;

class AuthController extends Controller
{
    /**
     * User login.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $permissions = $user->getAllPermissions();
        $permissionsByModule = $user->getPermissionsByModule();

        $user->load('roles');

        // Get required settings (business logo, company name, etc.)
        $settings = $this->getRequiredSettings();

        return response()->json([
            'token' => $token,
            'user' => $this->formatUserData($user),
            'permissions' => $permissions,
            'permissionsByModule' => $permissionsByModule,
            'settings' => $settings,
        ]);
    }

    /**
     * User logout.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Format user data.
     *
     * @param User $user
     * @return array
     */
    protected function formatUserData(User $user)
    {
        // Get raw attributes to avoid accessor interference
        $userData = $user->getAttributes();
        $userData['roles'] = $user->roles->toArray();
        $userData['created_at'] = $user->created_at;
        $userData['updated_at'] = $user->updated_at;
        
        // Handle avatar URL
        $avatarPath = $userData['avatar'] ?? null;
        $avatarUrl = null;
        
        if ($avatarPath) {
            // Generate storage URL with correct backend path
            $avatarUrl = $this->getStorageUrl($avatarPath);
        }
        
        $userData['avatar_url'] = $avatarUrl;
        $userData['avatar'] = $avatarPath; // Keep relative path
        
        return $userData;
    }

    /**
     * Get current authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = $request->user()->load('roles');
        $permissions = $user->getAllPermissions();
        $permissionsByModule = $user->getPermissionsByModule();

        // Get required settings (business logo, company name, etc.)
        $settings = $this->getRequiredSettings();

        return response()->json([
            'user' => $this->formatUserData($user),
            'permissions' => $permissions,
            'permissionsByModule' => $permissionsByModule,
            'settings' => $settings,
        ]);
    }

    /**
     * Get required settings for frontend.
     *
     * @return array
     */
    protected function getRequiredSettings()
    {
        $appUrl = rtrim(config('app.url'), '/');
        
        // Get business logo
        $logoPath = Setting::get('business_logo', 'Business Information');
        $logoUrl = null;
        if ($logoPath) {
            if (str_starts_with($logoPath, 'http')) {
                $logoUrl = $logoPath;
            } else {
                // Generate storage URL with correct backend path
                $logoUrl = $this->getStorageUrl($logoPath);
            }
        }

        // Get company name
        $companyName = Setting::get('company_name', 'Business Information') 
            ?: Setting::get('business_name', 'Business Information')
            ?: 'Photo Studio Management';

        return [
            'business_logo' => $logoUrl,
            'business_logo_path' => $logoPath,
            'company_name' => $companyName,
        ];
    }

    /**
     * Send password reset link.
     *
     * @param Request $request
     * @param EmailService $emailService
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request, EmailService $emailService)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal if user exists or not for security
            \Log::info('Password reset requested for non-existent email', [
                'email' => $request->email
            ]);
            return response()->json([
                'success' => true, // Return success for security (don't reveal if user exists)
                'message' => 'If that email address exists in our system, we will send a password reset link.'
            ], 200);
        }

        // Generate password reset token
        $token = Password::createToken($user);

        // Build reset URL
        // Note: Frontend uses HashRouter, so we need to use # in the URL
        // Get web_url from App Settings, fallback to config, then to default
        $webUrl = Setting::get('web_url', 'App Settings');
        if (empty($webUrl)) {
            $webUrl = config('app.frontend_url', 'http://localhost:5173');
        }
        // Ensure web_url doesn't have trailing slash
        $webUrl = rtrim($webUrl, '/');
        $resetUrl = "{$webUrl}/#/reset-password?token={$token}&email=" . urlencode($user->email);

        // Send email using EmailService (uses database email settings)
        try {
            \Log::info('Attempting to send password reset email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reset_url' => $resetUrl
            ]);

            // sendEmailImmediately now throws exceptions on failure, returns true on success
            $emailSent = $emailService->sendEmailImmediately(
                $user->email,
                'password_reset',
                [
                    'user' => $user,
                    'url' => $resetUrl,
                    'token' => $token,
                ],
                $user->id,
                'user'
            );

            // If we reach here, email was sent successfully
            \Log::info('Password reset email sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reset_url' => $resetUrl
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Password reset link has been sent to your email address.'
            ], 200);

        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            
            \Log::error('Password reset email exception', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $errorMessage,
                'trace' => $e->getTraceAsString()
            ]);

            // Provide user-friendly error message
            $userMessage = 'Failed to send password reset email. ';
            
            // Check for specific error types
            if (strpos($errorMessage, 'SMTP Host cannot be an email address') !== false) {
                $userMessage .= 'Email configuration error: SMTP Host is set incorrectly. Please configure Email Settings in the admin panel.';
            } elseif (strpos($errorMessage, 'Email configuration is incomplete') !== false) {
                $userMessage .= 'Email configuration is incomplete. Please configure Email Settings in the admin panel.';
            } elseif (strpos($errorMessage, 'Cannot connect to SMTP server') !== false || strpos($errorMessage, 'Connection could not be established') !== false) {
                $userMessage .= 'Cannot connect to email server. Please verify Email Settings configuration (SMTP Host, Port, Username, Password).';
            } else {
                $userMessage .= 'Please check your email configuration in Settings or contact administrator. Error: ' . $errorMessage;
            }

            return response()->json([
                'success' => false,
                'message' => $userMessage
            ], 500);
        }
    }

    /**
     * Reset password using token.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully.'
            ], 200);
        }

        // Handle different error statuses
        $errorMessage = 'Failed to reset password.';
        switch ($status) {
            case Password::INVALID_TOKEN:
                $errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
                break;
            case Password::INVALID_USER:
                $errorMessage = 'Invalid user. Please check your email address.';
                break;
            case Password::THROTTLED:
                $errorMessage = 'Too many reset attempts. Please try again later.';
                break;
            default:
                $errorMessage = __($status) ?: 'Failed to reset password. Please try again.';
        }

        throw ValidationException::withMessages([
            'email' => [$errorMessage],
        ]);
    }

    /**
     * Change password for authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully.'
        ], 200);
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

