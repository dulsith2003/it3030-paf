package com.example.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.smartcampus.model.Booking;
import com.example.smartcampus.model.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceIdAndStatus(Long resourceId, BookingStatus status);

    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Booking> findByResourceIdAndStartTimeLessThanAndEndTimeGreaterThan(
        Long resourceId,
        LocalDateTime endTime,
        LocalDateTime startTime
    );
}
