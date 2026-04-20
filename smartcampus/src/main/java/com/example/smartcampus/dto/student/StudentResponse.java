package com.example.smartcampus.dto.student;

import java.time.Instant;

public record StudentResponse(
    String id,
    String fullName,
    String email,
    String department,
    Integer yearOfStudy,
    Boolean active,
    Instant createdAt,
    Instant updatedAt
) {
}
