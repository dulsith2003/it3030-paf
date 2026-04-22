package com.example.smartcampus.dto.booking;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingRequestDTO(
    @NotNull(message = "resourceId is required")
    Long resourceId,

    @NotBlank(message = "userId is required")
    String userId,

    @NotNull(message = "startTime is required")
    @Future(message = "startTime must be in the future")
    LocalDateTime startTime,

    @NotNull(message = "endTime is required")
    @Future(message = "endTime must be in the future")
    LocalDateTime endTime,

    @Size(max = 500, message = "purpose can have a maximum of 500 characters")
    String purpose
) {
}
