<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $body;
    public $fromEmail;
    public $fromName;
    public $attachments;

    /**
     * Create a new message instance.
     *
     * @param string $subject
     * @param string $body
     * @param string|null $fromEmail
     * @param string|null $fromName
     * @param array $attachments
     */
    public function __construct($subject, $body, $fromEmail = null, $fromName = null, $attachments = [])
    {
        $this->subject = $subject;
        $this->body = $body;
        $this->fromEmail = $fromEmail;
        $this->fromName = $fromName;
        $this->attachments = $attachments;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $mail = $this->subject($this->subject)
            ->html($this->body);

        if ($this->fromEmail) {
            $mail->from($this->fromEmail, $this->fromName);
        }

        foreach ($this->attachments as $attachment) {
            if (is_array($attachment)) {
                $mail->attach($attachment['path'], [
                    'as' => $attachment['as'] ?? null,
                    'mime' => $attachment['mime'] ?? null,
                ]);
            } else {
                $mail->attach($attachment);
            }
        }

        return $mail;
    }
}

