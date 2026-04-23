package com.example.smartcampus.dto.booking;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingRequestDTO(
    @NotBlank(message = "resourceId is required")
    String resourceId,

    @NotNull(message = "date is required")
    LocalDate date,

    @NotNull(message = "startTime is required")
    LocalTime startTime,

    @NotNull(message = "endTime is required")
    LocalTime endTime,

    @Size(max = 500, message = "purpose can have a maximum of 500 characters")
    String purpose,

    @NotNull(message = "expectedAttendees is required")
    @Min(value = 1, message = "expectedAttendees must be at least 1")
    Integer expectedAttendees
) {
}
