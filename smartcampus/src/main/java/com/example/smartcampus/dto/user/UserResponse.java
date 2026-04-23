package com.example.smartcampus.dto.user;

import java.time.Instant;
import java.util.Set;

import com.example.smartcampus.model.AuthProvider;
import com.example.smartcampus.model.Role;

public record UserResponse(
    String id,
    String email,
    String displayName,
    String avatarUrl,
    AuthProvider authProvider,
    String providerId,
    Set<Role> roles,
    Instant lastLoginAt,
    Instant createdAt,
    Instant updatedAt
) {
}
