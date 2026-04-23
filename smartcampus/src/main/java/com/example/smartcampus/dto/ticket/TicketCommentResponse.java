package com.example.smartcampus.dto.ticket;

import java.time.Instant;

public record TicketCommentResponse(
    String id,
    String text,
    String authorName,
    String authorRole,
    Instant createdAt,
    Instant updatedAt
) {
}
