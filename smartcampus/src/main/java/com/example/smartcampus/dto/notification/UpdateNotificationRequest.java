package com.example.smartcampus.dto.notification;

import jakarta.validation.constraints.NotBlank;

public record UpdateNotificationRequest(
    @NotBlank(message = "title is required")
    String title,

    @NotBlank(message = "message is required")
    String message,

    @NotBlank(message = "type is required")
    String type,

    Boolean read
) {
}
