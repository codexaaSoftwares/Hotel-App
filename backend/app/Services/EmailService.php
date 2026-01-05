<?php

namespace App\Services;

use App\Mail\GenericEmail;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Send email immediately and log the result.
     *
     * @param string $to
     * @param string $type
     * @param array $data
     * @param int|null $relatedId
     * @param string|null $relatedType
     * @param array $attachments
     * @param string|null $bodyOverride
     * @return bool
     */
    public function sendEmailImmediately($to, $type, $data = [], $relatedId = null, $relatedType = null, $attachments = [], $bodyOverride = null)
    {
        try {
            $emailSettings = $this->getEmailSettings();
            $this->configureMailSettings($emailSettings);

            $subject = $this->getSubject($type, $data);
            $body = $bodyOverride ?? $this->renderTemplate($type, $data);

            $fromEmail = $emailSettings['from_address'] ?? config('mail.from.address');
            $fromName = $emailSettings['from_name'] ?? config('mail.from.name');
            
            // Validate required email settings
            $missingFields = [];
            if (empty($emailSettings['host'])) {
                $missingFields[] = 'SMTP Host';
            }
            if (empty($emailSettings['username'])) {
                $missingFields[] = 'SMTP User';
            }
            if (empty($emailSettings['password'])) {
                $missingFields[] = 'SMTP Password';
            }
            if (empty($fromEmail)) {
                $missingFields[] = 'From Email';
            }
            
            if (!empty($missingFields)) {
                throw new \Exception('Email configuration is incomplete. Please configure the following in Email Settings: ' . implode(', ', $missingFields));
            }

            // Validate SMTP host format (should not be an email address)
            $smtpHost = config('mail.mailers.smtp.host');
            if (filter_var($smtpHost, FILTER_VALIDATE_EMAIL)) {
                throw new \Exception('SMTP Host cannot be an email address. Please enter the SMTP server hostname (e.g., smtp.gmail.com, smtp.mailtrap.io).');
            }
            
            // Log email attempt
            Log::info('Attempting to send email', [
                'to' => $to,
                'type' => $type,
                'from' => $fromEmail,
                'mailer' => config('mail.default'),
                'host' => $smtpHost,
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
            ]);

            $mailable = new GenericEmail($subject, $body, $fromEmail, $fromName, $attachments);

            Mail::to($to)->send($mailable);

            $this->logEmail($to, $fromEmail, $type, $subject, $body, 'success', 'Email sent successfully', $relatedId, $relatedType);

            Log::info('Email sent successfully', ['to' => $to, 'type' => $type]);

            return true;
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            
            // Provide more helpful error messages for common issues
            $userFriendlyMessage = $errorMessage;
            if (strpos($errorMessage, 'getaddrinfo') !== false || strpos($errorMessage, 'Connection could not be established') !== false) {
                $smtpHost = config('mail.mailers.smtp.host');
                if (filter_var($smtpHost, FILTER_VALIDATE_EMAIL)) {
                    $userFriendlyMessage = 'SMTP Host is set to an email address. Please use the SMTP server hostname instead (e.g., smtp.gmail.com for Gmail, smtp.mailtrap.io for Mailtrap).';
                } else {
                    $userFriendlyMessage = 'Cannot connect to SMTP server. Please verify: 1) SMTP Host is correct, 2) Port is correct, 3) Firewall allows the connection.';
                }
            }
            
            Log::error('Email sending failed', [
                'to' => $to,
                'type' => $type,
                'error' => $errorMessage,
                'user_friendly_message' => $userFriendlyMessage,
                'trace' => $e->getTraceAsString(),
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
            ]);
            
            try {
                $this->logEmail(
                    $to,
                    $emailSettings['from_address'] ?? config('mail.from.address'),
                    $type,
                    $this->getSubject($type, $data),
                    $bodyOverride ?? $this->renderTemplate($type, $data),
                    'failed',
                    $userFriendlyMessage,
                    $relatedId,
                    $relatedType
                );
            } catch (\Exception $logException) {
                Log::error('Failed to log email error', [
                    'error' => $logException->getMessage()
                ]);
            }

            // Re-throw with user-friendly message
            // Note: This exception will be caught by the calling controller
            throw new \Exception($userFriendlyMessage);
        }
    }

    /**
     * Get email settings from database or fallback to config.
     *
     * @return array
     */
    public function getEmailSettings()
    {
        // Try both 'email' and 'Email Settings' as group names
        $dbSettings = Setting::getAsArray('Email Settings');
        
        // If empty, try 'email' (lowercase)
        if (empty($dbSettings)) {
            $dbSettings = Setting::getAsArray('email');
        }
        
        // If database settings are empty or incomplete, use config/env settings
        if (empty($dbSettings) || !isset($dbSettings['host'])) {
            return [
                'mailer' => config('mail.default', 'smtp'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port', '587'),
                'username' => config('mail.mailers.smtp.username'),
                'password' => config('mail.mailers.smtp.password'),
                'encryption' => config('mail.mailers.smtp.encryption'),
                'from_address' => config('mail.from.address'),
                'from_name' => config('mail.from.name'),
            ];
        }
        
        // Ensure port has a default value of 587 if empty
        if (empty($dbSettings['port'])) {
            $dbSettings['port'] = '587';
        }
        
        return $dbSettings;
    }

    /**
     * Configure mail settings dynamically.
     *
     * @param array $emailSettings
     * @return void
     */
    public function configureMailSettings($emailSettings)
    {
        if (isset($emailSettings['mailer'])) {
            config(['mail.default' => $emailSettings['mailer']]);
        }

        if (isset($emailSettings['host'])) {
            config(['mail.mailers.smtp.host' => $emailSettings['host']]);
        }

        if (isset($emailSettings['port'])) {
            // Convert port to integer if it's a string
            $port = is_numeric($emailSettings['port']) ? (int)$emailSettings['port'] : $emailSettings['port'];
            config(['mail.mailers.smtp.port' => $port]);
        }

        if (isset($emailSettings['username'])) {
            config(['mail.mailers.smtp.username' => $emailSettings['username']]);
        }

        if (isset($emailSettings['password'])) {
            config(['mail.mailers.smtp.password' => $emailSettings['password']]);
        }

        if (isset($emailSettings['encryption'])) {
            // Handle empty encryption (set to null for no encryption)
            $encryption = !empty($emailSettings['encryption']) ? $emailSettings['encryption'] : null;
            config(['mail.mailers.smtp.encryption' => $encryption]);
        }

        if (isset($emailSettings['from_address'])) {
            config(['mail.from.address' => $emailSettings['from_address']]);
        }

        if (isset($emailSettings['from_name'])) {
            config(['mail.from.name' => $emailSettings['from_name']]);
        }
    }

    /**
     * Log email attempt.
     *
     * @param string $toEmail
     * @param string $fromEmail
     * @param string $type
     * @param string $subject
     * @param string $body
     * @param string $sendStatus
     * @param string $responseMessage
     * @param int|null $relatedId
     * @param string|null $relatedType
     * @return void
     */
    public function logEmail($toEmail, $fromEmail, $type, $subject, $body, $sendStatus, $responseMessage, $relatedId = null, $relatedType = null)
    {
        DB::table('emails')->insert([
            'to_email' => $toEmail,
            'from_email' => $fromEmail,
            'type' => $type,
            'subject' => $subject,
            'body' => $body,
            'send_status' => $sendStatus,
            'response_message' => $responseMessage,
            'related_id' => $relatedId,
            'related_type' => $relatedType,
            'sent_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Render email template.
     *
     * @param string $type
     * @param array $data
     * @return string
     */
    public function renderTemplate($type, $data = [])
    {
        try {
            $view = "emails.{$type}";
            if (view()->exists($view)) {
                return view($view, $data)->render();
            }
        } catch (\Exception $e) {
            Log::warning("Email template {$type} not found, using fallback");
        }

        // Fallback template
        return view('emails.generic', array_merge($data, ['type' => $type]))->render();
    }

    /**
     * Get email subject based on type.
     *
     * @param string $type
     * @param array $data
     * @return string
     */
    public function getSubject($type, $data = [])
    {
        $subjects = [
            'password_reset' => 'Password Reset Request',
            'welcome' => 'Welcome to ' . config('app.name'),
            'notification' => 'Notification from ' . config('app.name'),
            'test' => 'Test Email from ' . config('app.name'),
        ];

        return $subjects[$type] ?? 'Email from ' . config('app.name');
    }
}

