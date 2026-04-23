package com.example.smartcampus.dto.ticket;

import jakarta.validation.constraints.Size;

public record UpdateAssignmentRequest(
    @Size(max = 120) String assignedTechnician,
    @Size(max = 1200) String resolutionNotes
) {
}
