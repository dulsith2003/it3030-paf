package com.example.smartcampus.dto.ticket;

import com.example.smartcampus.model.ticket.TicketPriority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public record CreateTicketRequest(
    @NotBlank @Size(max = 120) String resourceLocation,
    @NotBlank @Size(max = 60) String category,
    @NotBlank @Size(max = 1200) String description,
    @NotNull TicketPriority priority,
    @NotBlank @Size(max = 120) String preferredContact,
    @Size(max = 3) List<@Valid AttachmentInput> attachments
) {
    public List<AttachmentInput> safeAttachments() {
        return attachments == null ? new ArrayList<>() : attachments;
    }
}
