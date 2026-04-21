package com.example.smartcampus.dto.user;

import java.util.Set;

import com.example.smartcampus.model.Role;

public record PatchRolesRequest(
    Set<Role> addRoles,
    Set<Role> removeRoles
) {
}
