package com.example.smartcampus.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateStudentRequest(
    @NotBlank(message = "fullName is required")
    String fullName,

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    String email,

    @NotBlank(message = "department is required")
    String department,

    @NotNull(message = "yearOfStudy is required")
    @Min(value = 1, message = "yearOfStudy must be between 1 and 8")
    @Max(value = 8, message = "yearOfStudy must be between 1 and 8")
    Integer yearOfStudy,

    @NotNull(message = "active is required")
    Boolean active
) {
}
