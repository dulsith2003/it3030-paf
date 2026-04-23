package com.example.smartcampus.controller;

import com.example.smartcampus.dto.ticket.UpdateAssignmentRequest;
import com.example.smartcampus.dto.ticket.UpdateTicketStatusRequest;
import com.example.smartcampus.dto.ticket.RejectTicketRequest;
import com.example.smartcampus.dto.ticket.TicketResponse;
import com.example.smartcampus.model.ticket.TicketStatus;
import com.example.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Module C – Maintenance & Incident Ticketing
 * Exposes the PUT-style management endpoints required by the Module C spec:
 * PUT /api/tickets/{id}/assign (ADMIN)
 * PUT /api/tickets/{id}/reject (ADMIN)
 * PUT /api/tickets/{id}/status (TECHNICIAN / ADMIN)
 *
 * Role enforcement is handled inside TicketService (Actor pattern).
 * This controller does NOT modify the existing TicketController.
 */
@RestController
@RequestMapping("/api/tickets")
public class TicketManagementController {

    private final TicketService ticketService;

    public TicketManagementController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /*
     * ------------------------------------------------------------------ *
     * PUT /api/tickets/{id}/assign – ADMIN *
     * ------------------------------------------------------------------
     */
    @PutMapping("/{ticketId}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable String ticketId,
            @RequestBody @Valid UpdateAssignmentRequest request,
            @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole) {
        TicketResponse response = ticketService.updateAssignment(ticketId, request, actor(userName, userRole));
        return ResponseEntity.ok(response);
    }

    /*
     * ------------------------------------------------------------------ *
     * PUT /api/tickets/{id}/reject – ADMIN *
     * ------------------------------------------------------------------
     */
    @PutMapping("/{ticketId}/reject")
    public ResponseEntity<TicketResponse> rejectTicket(
            @PathVariable String ticketId,
            @RequestBody @Valid RejectTicketRequest request,
            @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole) {
        UpdateTicketStatusRequest statusRequest = new UpdateTicketStatusRequest(
                TicketStatus.REJECTED,
                request.rejectionReason(),
                null);
        TicketResponse response = ticketService.updateStatus(ticketId, statusRequest, actor(userName, userRole));
        return ResponseEntity.ok(response);
    }

    /*
     * ------------------------------------------------------------------ *
     * PUT /api/tickets/{id}/status – TECHNICIAN / ADMIN *
     * ------------------------------------------------------------------
     */
    @PutMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable String ticketId,
            @RequestBody @Valid UpdateTicketStatusRequest request,
            @RequestHeader(value = "X-User-Name", defaultValue = "anonymous") String userName,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole) {
        TicketResponse response = ticketService.updateStatus(ticketId, request, actor(userName, userRole));
        return ResponseEntity.ok(response);
    }

    /* ------------------------------------------------------------------ */
    private TicketService.Actor actor(String userName, String userRole) {
        String cleanName = userName == null || userName.isBlank() ? "anonymous" : userName.trim();
        String cleanRole = userRole == null || userRole.isBlank() ? "USER" : userRole.trim().toUpperCase();
        return new TicketService.Actor(cleanName, cleanRole);
    }
}
