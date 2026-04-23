package com.example.smartcampus.controller;

import com.example.smartcampus.dto.ticket.AddCommentRequest;
import com.example.smartcampus.dto.ticket.CreateTicketRequest;
import com.example.smartcampus.dto.ticket.TicketResponse;
import com.example.smartcampus.dto.ticket.UpdateAssignmentRequest;
import com.example.smartcampus.dto.ticket.UpdateCommentRequest;
import com.example.smartcampus.dto.ticket.UpdateTicketStatusRequest;
import com.example.smartcampus.model.ticket.TicketStatus;
import com.example.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
        @RequestBody @Valid CreateTicketRequest request,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        TicketResponse response = ticketService.createTicket(request, actor(userName, userRole));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> listTickets(
        @RequestParam(required = false) TicketStatus status,
        @RequestParam(defaultValue = "false") boolean mine,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.listTickets(status, mine, actor(userName, userRole)));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicket(
        @PathVariable String ticketId,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.getTicket(ticketId, actor(userName, userRole)));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateStatus(
        @PathVariable String ticketId,
        @RequestBody @Valid UpdateTicketStatusRequest request,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, request, actor(userName, userRole)));
    }

    @PatchMapping("/{ticketId}/assignment")
    public ResponseEntity<TicketResponse> updateAssignment(
        @PathVariable String ticketId,
        @RequestBody @Valid UpdateAssignmentRequest request,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.updateAssignment(ticketId, request, actor(userName, userRole)));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketResponse> addComment(
        @PathVariable String ticketId,
        @RequestBody @Valid AddCommentRequest request,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.addComment(ticketId, request, actor(userName, userRole)));
    }

    @PatchMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketResponse> updateComment(
        @PathVariable String ticketId,
        @PathVariable String commentId,
        @RequestBody @Valid UpdateCommentRequest request,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, request, actor(userName, userRole)));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketResponse> deleteComment(
        @PathVariable String ticketId,
        @PathVariable String commentId,
        @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        return ResponseEntity.ok(ticketService.deleteComment(ticketId, commentId, actor(userName, userRole)));
    }

    private TicketService.Actor actor(String userName, String userRole) {
        String cleanName = userName == null || userName.isBlank() ? "anonymous" : userName.trim();
        String cleanRole = userRole == null || userRole.isBlank() ? "USER" : userRole.trim().toUpperCase();
        return new TicketService.Actor(cleanName, cleanRole);
    }
}
