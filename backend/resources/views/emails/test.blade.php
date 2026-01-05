<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        .success-box {
            background-color: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box {
            background-color: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Email</h1>
    </div>
    <div class="content">
        <div class="success-box">
            <h2 style="margin-top: 0; color: #059669;">✓ Email Configuration Successful!</h2>
            <p>This is a test email to verify that your email settings are configured correctly.</p>
        </div>
        
        <p>Hello,</p>
        <p>If you are receiving this email, it means your email configuration is working properly!</p>
        
        @if(isset($message))
            <div class="info-box">
                <p><strong>Message:</strong> {{ $message }}</p>
            </div>
        @endif
        
        @if(isset($timestamp))
            <p><strong>Sent at:</strong> {{ $timestamp }}</p>
        @endif
        
        <div class="info-box">
            <p><strong>What this means:</strong></p>
            <ul>
                <li>Your SMTP settings are correct</li>
                <li>Email service is properly configured</li>
                <li>You can now send emails from the application</li>
            </ul>
        </div>
        
        <p>You can now use the email functionality in your Photo Studio Management application.</p>
    </div>
    <div class="footer">
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        <p>This is an automated test email. No action is required.</p>
    </div>
</body>
</html>

