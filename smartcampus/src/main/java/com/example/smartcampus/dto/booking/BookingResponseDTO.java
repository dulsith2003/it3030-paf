package com.example.smartcampus.dto.booking;

import java.time.LocalDate;
import java.time.LocalTime;

import com.example.smartcampus.model.BookingStatus;

public record BookingResponseDTO(
    String id,
    String resourceId,
    String userId,
    LocalDate date,
    LocalTime startTime,
    LocalTime endTime,
    String purpose,
    Integer expectedAttendees,
    BookingStatus status,
    String adminReason
) {
}
