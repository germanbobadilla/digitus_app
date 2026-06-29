<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailCode extends Notification
{
    use Queueable;

    public function __construct(private readonly string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('notifications.verify_subject'))
            ->greeting(__('notifications.verify_greeting', ['name' => $notifiable->name]))
            ->line(__('notifications.verify_intro'))
            ->line('**' . $this->code . '**')
            ->line(__('notifications.verify_expires'))
            ->line(__('notifications.verify_ignore'));
    }
}
