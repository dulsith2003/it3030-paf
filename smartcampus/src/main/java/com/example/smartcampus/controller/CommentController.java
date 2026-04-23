package com.example.smartcampus.controller;

import com.example.smartcampus.dto.ticket.TicketCommentResponse;
import com.example.smartcampus.dto.ticket.TicketResponse;
import com.example.smartcampus.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Module C – CommentController
 *
 * Adds the two comment endpoints NOT already covered by TicketController:
 *
 * GET /api/tickets/{ticketId}/comments – ALL authenticated roles
 * DELETE /api/comments/{commentId}?ticketId= – comment owner or ADMIN
 *
 * NOTE: POST /api/tickets/{ticketId}/comments is already handled by
 * the existing TicketController and must NOT be duplicated here.
 */
@RestController
public class CommentController {

    private final TicketService ticketService;

    public CommentController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /*
     * ------------------------------------------------------------------ *
     * GET /api/tickets/{ticketId}/comments – ALL authenticated roles *
     * ------------------------------------------------------------------
     */
    @GetMapping("/api/tickets/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole) {
        TicketResponse ticket = ticketService.getTicket(ticketId, actor(userName, userRole));
        return ResponseEntity.ok(ticket.comments());
    }

    /*
     * ------------------------------------------------------------------ *
     * DELETE /api/comments/{commentId}?ticketId=... – comment owner *
     * ------------------------------------------------------------------
     */
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @RequestParam String ticketId,
            @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole) {
        ticketService.deleteComment(ticketId, commentId, actor(userName, userRole));
        return ResponseEntity.noContent().build();
    }

    /* ------------------------------------------------------------------ */
    private TicketService.Actor actor(String userName, String userRole) {
        String cleanName = userName == null || userName.isBlank() ? "anonymous" : userName.trim();
        String cleanRole = userRole == null || userRole.isBlank() ? "USER" : userRole.trim().toUpperCase();
        return new TicketService.Actor(cleanName, cleanRole);
    }
}
