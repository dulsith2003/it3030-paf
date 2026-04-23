package com.example.smartcampus.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.model.Booking;
import com.example.smartcampus.model.BookingStatus;
import com.example.smartcampus.repository.BookingRepository;

@Service
@SuppressWarnings("null")
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        validateBookingTimeRange(request);
        String currentUserId = getCurrentUserId();

        boolean hasConflict = bookingRepository
            .findByResourceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                request.resourceId(),
                request.endTime(),
                request.startTime()
            )
            .stream()
            .anyMatch(existing -> existing.getStatus() != BookingStatus.REJECTED
                && existing.getStatus() != BookingStatus.CANCELLED);

        if (hasConflict) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Booking conflict: selected time slot is already booked for this resource"
            );
        }

        LocalDateTime now = LocalDateTime.now();
        Booking booking = new Booking();
        booking.setResourceId(request.resourceId());
        booking.setUserId(currentUserId);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public List<BookingResponseDTO> getMyBookings() {
        String currentUserId = getCurrentUserId();
        return bookingRepository.findByUserId(currentUserId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public List<BookingResponseDTO> getAllBookings() {
        requireAdmin();
        return bookingRepository.findAll()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public BookingResponseDTO approveBooking(String bookingId) {
        requireAdmin();

        Booking booking = getBookingById(bookingId);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponseDTO rejectBooking(String bookingId, String reason) {
        requireAdmin();

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Reject reason is required");
        }

        Booking booking = getBookingById(bookingId);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponseDTO cancelBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        String currentUserId = getCurrentUserId();

        if (!currentUserId.equals(booking.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can cancel only your own booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only APPROVED bookings can be cancelled"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    private Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }

    private void validateBookingTimeRange(BookingRequestDTO request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        return authentication.getName();
    }

    private void requireAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())
                || "ADMIN".equals(authority.getAuthority()));

        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can perform this action");
        }
    }

    private BookingResponseDTO toResponse(Booking booking) {
        return new BookingResponseDTO(
            booking.getId(),
            booking.getResourceId(),
            booking.getUserId(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getStatus(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}
