package com.example.smartcampus.service;

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
import com.example.smartcampus.model.Role;
import com.example.smartcampus.model.User;
import com.example.smartcampus.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;

    public BookingService(BookingRepository bookingRepository, UserService userService) {
        this.bookingRepository = bookingRepository;
        this.userService = userService;
    }

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        validateBookingTimeRange(request);
        String currentUserId = getCurrentUserId();
        // Conflict detection: fetch existing bookings for same resource and date
        var existing = bookingRepository.findByResourceIdAndDate(request.resourceId(), request.date());

        for (Booking b : existing) {
            if (b.getStatus() == BookingStatus.REJECTED || b.getStatus() == BookingStatus.CANCELLED) {
                continue;
            }

            // Overlap: newStart < existingEnd AND newEnd > existingStart
            if (request.startTime().isBefore(b.getEndTime()) && request.endTime().isAfter(b.getStartTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking conflict detected for this resource and time");
            }
        }

        Booking booking = new Booking();
        booking.setResourceId(request.resourceId());
        booking.setUserId(currentUserId);
        booking.setDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose());
        booking.setExpectedAttendees(request.expectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setAdminReason(null);

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

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be approved"
            );
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(null);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponseDTO rejectBooking(String bookingId, String reason) {
        requireAdmin();

        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reject reason is required");
        }

        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be rejected"
            );
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason.trim());

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponseDTO cancelBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        String currentUserId = getCurrentUserId();

        if (!currentUserId.equals(booking.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can cancel only your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminReason(null);
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
        User currentUser = userService.getCurrentUserEntity(authentication);
        return currentUser.getId();
    }

    private void requireAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getCurrentUserEntity(authentication);

        if (!currentUser.getRoles().contains(Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    private BookingResponseDTO toResponse(Booking booking) {
        return new BookingResponseDTO(
            booking.getId(),
            booking.getResourceId(),
            booking.getUserId(),
            booking.getDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getExpectedAttendees(),
            booking.getStatus(),
            booking.getAdminReason()
        );
    }
}
