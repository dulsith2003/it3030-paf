package com.example.smartcampus.dto.user;

import java.util.Set;

import com.example.smartcampus.model.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record CreateUserRequest(
    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    String email,

    @NotBlank(message = "displayName is required")
    String displayName,

    String avatarUrl,

    @NotEmpty(message = "at least one role is required")
    Set<Role> roles
) {
}
