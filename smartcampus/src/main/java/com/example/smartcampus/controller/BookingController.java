package com.example.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.service.BookingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/bookings")
@Validated
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponseDTO createBooking(@Valid @RequestBody BookingRequestDTO request) {
        return bookingService.createBooking(request);
    }

    @GetMapping("/my")
    public List<BookingResponseDTO> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponseDTO cancelBooking(@PathVariable String id) {
        return bookingService.cancelBooking(id);
    }

    @GetMapping("/admin")
    public List<BookingResponseDTO> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PatchMapping("/{id}/approve")
    public BookingResponseDTO approveBooking(@PathVariable String id) {
        return bookingService.approveBooking(id);
    }

    @PatchMapping("/{id}/reject")
    public BookingResponseDTO rejectBooking(
        @PathVariable String id,
        @Valid @RequestBody RejectBookingRequest request
    ) {
        return bookingService.rejectBooking(id, request.reason());
    }

    public record RejectBookingRequest(
        @NotBlank(message = "reason is required")
        String reason
    ) {
    }
}
