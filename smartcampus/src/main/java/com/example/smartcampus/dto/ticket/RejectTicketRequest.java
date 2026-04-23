package com.example.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Module C – DTO for PUT /api/tickets/{id}/reject
 */
public record RejectTicketRequest(
        @NotBlank(message = "Rejection reason is required") @Size(max = 400, message = "Rejection reason must be at most 400 characters") String rejectionReason) {
}
