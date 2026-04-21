package com.example.smartcampus.dto.notification;

import java.time.Instant;

public record NotificationResponse(
    String id,
    String userId,
    String title,
    String message,
    String type,
    Boolean read,
    Instant createdAt,
    Instant updatedAt
) {
}
