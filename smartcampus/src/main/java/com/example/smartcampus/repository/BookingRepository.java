package com.example.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.smartcampus.model.Booking;
import com.example.smartcampus.model.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Booking> findByResourceIdAndStartTimeLessThanAndEndTimeGreaterThan(
        String resourceId,
        LocalDateTime endTime,
        LocalDateTime startTime
    );
}
