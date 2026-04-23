package com.example.smartcampus.repository;

import java.util.List;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.smartcampus.model.Booking;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceIdAndDate(String resourceId, java.time.LocalDate date);

    List<Booking> findByResourceIdAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
        String resourceId,
        LocalDate date,
        LocalTime endTime,
        LocalTime startTime
    );
}
