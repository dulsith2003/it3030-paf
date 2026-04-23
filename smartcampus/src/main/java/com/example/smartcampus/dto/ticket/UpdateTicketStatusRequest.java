package com.example.smartcampus.dto.ticket;

import com.example.smartcampus.model.ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateTicketStatusRequest(
    @NotNull TicketStatus status,
    @Size(max = 400) String rejectionReason,
    @Size(max = 1200) String resolutionNotes
) {
}
