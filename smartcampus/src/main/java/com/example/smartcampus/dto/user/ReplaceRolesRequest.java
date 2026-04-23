package com.example.smartcampus.dto.user;

import java.util.Set;

import com.example.smartcampus.model.Role;

import jakarta.validation.constraints.NotEmpty;

public record ReplaceRolesRequest(
    @NotEmpty(message = "roles cannot be empty")
    Set<Role> roles
) {
}
