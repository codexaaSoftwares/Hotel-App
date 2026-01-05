# Email Configuration Guide

## Email Setup for Password Reset

The forgot password feature requires email configuration to send password reset links.

### Option 1: Using .env File (Recommended for Development)

Add these settings to your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@photostudio.local
MAIL_FROM_NAME="Photo Studio Management"
```

### Option 2: Using Database Settings (Recommended for Production)

Configure email settings through the admin panel Settings section. The system will use database settings if available, otherwise it will fallback to `.env` settings.

### Testing Email Configuration

1. **Check Laravel Logs**: After attempting to send a password reset email, check `storage/logs/laravel.log` for detailed error messages.

2. **Check Email Logs Table**: The system logs all email attempts in the `emails` table. Check the `send_status` and `response_message` columns.

3. **Test with Mailtrap** (Development):
   - Sign up at https://mailtrap.io
   - Create an inbox
   - Use the SMTP credentials provided
   - All emails will be captured in Mailtrap inbox (not sent to real email)

4. **Test with Real SMTP** (Production):
   - Use Gmail, SendGrid, Mailgun, or any SMTP service
   - Update `.env` with real SMTP credentials
   - Emails will be sent to actual email addresses

### Common Issues

1. **Email not sending**:
   - Check SMTP credentials are correct
   - Verify firewall allows SMTP connections
   - Check Laravel logs for specific error messages

2. **Email going to spam**:
   - Use a proper "from" address
   - Configure SPF/DKIM records for your domain
   - Use a reputable email service

3. **Connection timeout**:
   - Check if port 587 (TLS) or 465 (SSL) is open
   - Verify SMTP host is correct
   - Check firewall settings

### Debugging

To see detailed email logs:
1. Check `storage/logs/laravel.log` for email-related entries
2. Query the `emails` table: `SELECT * FROM emails ORDER BY id DESC LIMIT 10;`
3. Enable detailed logging in `config/logging.php`

