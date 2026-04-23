package com.example.smartcampus.dto.ticket;

public record TicketAttachmentResponse(
    String fileName,
    String contentType,
    Integer sizeKb
) {
}
