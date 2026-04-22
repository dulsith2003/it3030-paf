package com.example.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.smartcampus.dto.user.CreateUserRequest;
import com.example.smartcampus.dto.user.PatchRolesRequest;
import com.example.smartcampus.dto.user.ReplaceRolesRequest;
import com.example.smartcampus.dto.user.UserResponse;
import com.example.smartcampus.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
@Validated
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return userService.listUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}/roles")
    public UserResponse replaceRoles(
        @PathVariable String id,
        @Valid @RequestBody ReplaceRolesRequest request
    ) {
        return userService.replaceRoles(id, request);
    }

    @PatchMapping("/{id}/roles")
    public UserResponse patchRoles(
        @PathVariable String id,
        @RequestBody PatchRolesRequest request
    ) {
        return userService.patchRoles(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }
}
