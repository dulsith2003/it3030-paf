package com.example.smartcampus.dto.notification;

import jakarta.validation.constraints.NotNull;

public record PatchNotificationReadRequest(
    @NotNull(message = "read is required")
    Boolean read
) {
}
