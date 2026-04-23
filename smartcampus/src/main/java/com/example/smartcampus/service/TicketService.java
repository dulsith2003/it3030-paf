package com.example.smartcampus.service;

import com.example.smartcampus.dto.ticket.AddCommentRequest;
import com.example.smartcampus.dto.ticket.AttachmentInput;
import com.example.smartcampus.dto.ticket.CreateTicketRequest;
import com.example.smartcampus.dto.ticket.TicketResponse;
import com.example.smartcampus.dto.ticket.UpdateAssignmentRequest;
import com.example.smartcampus.dto.ticket.UpdateCommentRequest;
import com.example.smartcampus.dto.ticket.UpdateTicketStatusRequest;
import com.example.smartcampus.exception.ForbiddenOperationException;
import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.model.Ticket;
import com.example.smartcampus.model.ticket.TicketAttachment;
import com.example.smartcampus.model.ticket.TicketComment;
import com.example.smartcampus.model.ticket.TicketStatus;
import com.example.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final Map<String, Ticket> fallbackStore = new ConcurrentHashMap<>();

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public TicketResponse createTicket(CreateTicketRequest request, Actor actor) {
        Ticket ticket = new Ticket();
        ticket.setResourceLocation(request.resourceLocation().trim());
        ticket.setCategory(request.category().trim());
        ticket.setDescription(request.description().trim());
        ticket.setPriority(request.priority());
        ticket.setPreferredContact(request.preferredContact().trim());
        ticket.setCreatedBy(actor.userName());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setAttachments(request.safeAttachments().stream().map(this::mapAttachment).toList());
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        Ticket saved = saveTicket(ticket);
        return TicketResponse.from(saved);
    }

    public List<TicketResponse> listTickets(TicketStatus status, boolean mineOnly, Actor actor) {
        return findAllTickets().stream()
            .filter(ticket -> status == null || ticket.getStatus() == status)
            .filter(ticket -> filterAccess(ticket, mineOnly, actor))
            .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
            .map(TicketResponse::from)
            .toList();
    }

    public TicketResponse getTicket(String ticketId, Actor actor) {
        Ticket ticket = findById(ticketId);
        if (!canViewTicket(ticket, actor)) {
            throw new ForbiddenOperationException("You can view only your own tickets.");
        }
        return TicketResponse.from(ticket);
    }

    public TicketResponse updateStatus(String ticketId, UpdateTicketStatusRequest request, Actor actor) {
        requireRole(actor, "TECHNICIAN", "STAFF", "ADMIN");

        Ticket ticket = findById(ticketId);
        TicketStatus current = ticket.getStatus();
        TicketStatus next = request.status();

        if (next == TicketStatus.REJECTED) {
            requireRole(actor, "ADMIN");
            if (current == TicketStatus.CLOSED || current == TicketStatus.REJECTED) {
                throw new IllegalArgumentException("Closed or rejected tickets cannot be rejected again.");
            }
            if (request.rejectionReason() == null || request.rejectionReason().isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required when status is REJECTED.");
            }
            ticket.setStatus(TicketStatus.REJECTED);
            ticket.setRejectionReason(request.rejectionReason().trim());
            ticket.setUpdatedAt(Instant.now());
            return TicketResponse.from(saveTicket(ticket));
        }

        if (!isValidForwardTransition(current, next)) {
            throw new IllegalArgumentException("Invalid workflow transition from " + current + " to " + next + ".");
        }

        ticket.setStatus(next);
        if (request.resolutionNotes() != null && !request.resolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.resolutionNotes().trim());
        }
        ticket.setRejectionReason(null);
        ticket.setUpdatedAt(Instant.now());

        return TicketResponse.from(saveTicket(ticket));
    }

    public TicketResponse updateAssignment(String ticketId, UpdateAssignmentRequest request, Actor actor) {
        requireRole(actor, "STAFF", "ADMIN");

        Ticket ticket = findById(ticketId);
        ticket.setAssignedTechnician(cleanNullable(request.assignedTechnician()));

        ticket.setResolutionNotes(cleanNullable(request.resolutionNotes()));

        ticket.setUpdatedAt(Instant.now());
        return TicketResponse.from(saveTicket(ticket));
    }

    public TicketResponse addComment(String ticketId, AddCommentRequest request, Actor actor) {
        Ticket ticket = findById(ticketId);
        if (!canViewTicket(ticket, actor)) {
            throw new ForbiddenOperationException("You can comment only on tickets you can view.");
        }

        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setText(request.text().trim());
        comment.setAuthorName(actor.userName());
        comment.setAuthorRole(actor.userRole());
        comment.setCreatedAt(Instant.now());

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(Instant.now());
        return TicketResponse.from(saveTicket(ticket));
    }

    public TicketResponse updateComment(String ticketId, String commentId, UpdateCommentRequest request, Actor actor) {
        Ticket ticket = findById(ticketId);
        TicketComment comment = findComment(ticket, commentId);
        requireCommentOwnerOrAdmin(comment, actor);

        comment.setText(request.text().trim());
        comment.setUpdatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        return TicketResponse.from(saveTicket(ticket));
    }

    public TicketResponse deleteComment(String ticketId, String commentId, Actor actor) {
        Ticket ticket = findById(ticketId);
        TicketComment comment = findComment(ticket, commentId);
        requireCommentOwnerOrAdmin(comment, actor);

        ticket.setComments(ticket.getComments().stream()
            .filter(current -> !Objects.equals(current.getId(), commentId))
            .toList());
        ticket.setUpdatedAt(Instant.now());

        return TicketResponse.from(saveTicket(ticket));
    }

    private Ticket findById(String ticketId) {
        try {
            return ticketRepository.findById(ticketId)
                .orElseGet(() -> findFallbackTicketById(ticketId));
        } catch (RuntimeException exception) {
            return findFallbackTicketById(ticketId);
        }
    }

    private Ticket findFallbackTicketById(String ticketId) {
        Ticket fallbackTicket = fallbackStore.get(ticketId);
        if (fallbackTicket == null) {
            throw new ResourceNotFoundException("Ticket not found for id: " + ticketId);
        }
        return fallbackTicket;
    }

    private List<Ticket> findAllTickets() {
        try {
            return ticketRepository.findAll();
        } catch (RuntimeException exception) {
            return List.copyOf(fallbackStore.values());
        }
    }

    private Ticket saveTicket(Ticket ticket) {
        try {
            return ticketRepository.save(ticket);
        } catch (RuntimeException exception) {
            if (ticket.getId() == null || ticket.getId().isBlank()) {
                ticket.setId(UUID.randomUUID().toString());
            }
            fallbackStore.put(ticket.getId(), ticket);
            return ticket;
        }
    }

    private TicketComment findComment(Ticket ticket, String commentId) {
        return ticket.getComments().stream()
            .filter(comment -> Objects.equals(comment.getId(), commentId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found for id: " + commentId));
    }

    private TicketAttachment mapAttachment(AttachmentInput input) {
        String fileName = input.fileName().trim();
        String contentType = input.contentType().trim().toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image attachments are allowed.");
        }
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException("Unsafe attachment filename detected.");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setFileName(fileName);
        attachment.setContentType(contentType);
        attachment.setSizeKb(input.sizeKb());
        return attachment;
    }

    private boolean filterAccess(Ticket ticket, boolean mineOnly, Actor actor) {
        if (mineOnly) {
            return isOwnTicket(ticket, actor.userName());
        }
        if (isUser(actor)) {
            return isOwnTicket(ticket, actor.userName());
        }
        return true;
    }

    private boolean canViewTicket(Ticket ticket, Actor actor) {
        if (isUser(actor)) {
            return isOwnTicket(ticket, actor.userName());
        }
        return true;
    }

    private boolean isOwnTicket(Ticket ticket, String userName) {
        return ticket.getCreatedBy() != null && ticket.getCreatedBy().equalsIgnoreCase(userName);
    }

    private boolean isUser(Actor actor) {
        return "USER".equalsIgnoreCase(actor.userRole());
    }

    private void requireRole(Actor actor, String... allowedRoles) {
        String actorRole = actor.userRole() == null ? "" : actor.userRole().trim().toUpperCase(Locale.ROOT);
        if (actorRole.startsWith("ROLE_")) {
            actorRole = actorRole.substring(5);
        }
        for (String role : allowedRoles) {
            if (role.equalsIgnoreCase(actorRole)) {
                return;
            }
        }
        throw new ForbiddenOperationException("Operation not allowed for role: " + actor.userRole());
    }

    private void requireCommentOwnerOrAdmin(TicketComment comment, Actor actor) {
        boolean isAdmin = "ADMIN".equalsIgnoreCase(actor.userRole());
        boolean owner = comment.getAuthorName() != null && comment.getAuthorName().equalsIgnoreCase(actor.userName());
        if (!isAdmin && !owner) {
            throw new ForbiddenOperationException("Only comment owner or ADMIN can modify this comment.");
        }
    }

    private boolean isValidForwardTransition(TicketStatus current, TicketStatus next) {
        if (current == TicketStatus.OPEN && next == TicketStatus.IN_PROGRESS) {
            return true;
        }
        if (current == TicketStatus.IN_PROGRESS && next == TicketStatus.RESOLVED) {
            return true;
        }
        if (current == TicketStatus.RESOLVED && next == TicketStatus.CLOSED) {
            return true;
        }
        return false;
    }

    private String cleanNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    public record Actor(String userName, String userRole) {
    }
}
