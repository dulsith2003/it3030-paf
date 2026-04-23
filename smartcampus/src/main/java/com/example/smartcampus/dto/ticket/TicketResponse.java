package com.example.smartcampus.dto.ticket;

import com.example.smartcampus.model.Ticket;
import com.example.smartcampus.model.ticket.TicketAttachment;
import com.example.smartcampus.model.ticket.TicketComment;
import com.example.smartcampus.model.ticket.TicketPriority;
import com.example.smartcampus.model.ticket.TicketStatus;

import java.time.Instant;
import java.util.List;

public record TicketResponse(
    String id,
    String resourceLocation,
    String category,
    String description,
    TicketPriority priority,
    String preferredContact,
    String createdBy,
    TicketStatus status,
    String assignedTechnician,
    String resolutionNotes,
    String rejectionReason,
    List<TicketAttachmentResponse> attachments,
    List<TicketCommentResponse> comments,
    Instant createdAt,
    Instant updatedAt
) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
            ticket.getId(),
            ticket.getResourceLocation(),
            ticket.getCategory(),
            ticket.getDescription(),
            ticket.getPriority(),
            ticket.getPreferredContact(),
            ticket.getCreatedBy(),
            ticket.getStatus(),
            ticket.getAssignedTechnician(),
            ticket.getResolutionNotes(),
            ticket.getRejectionReason(),
            ticket.getAttachments().stream().map(TicketResponse::mapAttachment).toList(),
            ticket.getComments().stream().map(TicketResponse::mapComment).toList(),
            ticket.getCreatedAt(),
            ticket.getUpdatedAt()
        );
    }

    private static TicketAttachmentResponse mapAttachment(TicketAttachment attachment) {
        return new TicketAttachmentResponse(
            attachment.getFileName(),
            attachment.getContentType(),
            attachment.getSizeKb()
        );
    }

    private static TicketCommentResponse mapComment(TicketComment comment) {
        return new TicketCommentResponse(
            comment.getId(),
            comment.getText(),
            comment.getAuthorName(),
            comment.getAuthorRole(),
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
