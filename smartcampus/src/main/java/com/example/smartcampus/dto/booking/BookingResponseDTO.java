package com.example.smartcampus.dto.booking;

import java.time.LocalDateTime;

import com.example.smartcampus.model.BookingStatus;

public record BookingResponseDTO(
    Long id,
    Long resourceId,
    String userId,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String purpose,
    BookingStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
