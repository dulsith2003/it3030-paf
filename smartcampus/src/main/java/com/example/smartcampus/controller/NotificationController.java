package com.example.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.smartcampus.dto.notification.CreateNotificationRequest;
import com.example.smartcampus.dto.notification.NotificationResponse;
import com.example.smartcampus.dto.notification.PatchNotificationReadRequest;
import com.example.smartcampus.dto.notification.UpdateNotificationRequest;
import com.example.smartcampus.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
@Validated
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> listNotifications(
        @RequestParam(defaultValue = "false") boolean all,
        Authentication authentication
    ) {
        return notificationService.listNotifications(authentication, all);
    }

    @GetMapping("/{id}")
    public NotificationResponse getNotification(@PathVariable String id, Authentication authentication) {
        return notificationService.getById(id, authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse create(
        @Valid @RequestBody CreateNotificationRequest request,
        Authentication authentication
    ) {
        return notificationService.create(request, authentication);
    }

    @PutMapping("/{id}")
    public NotificationResponse update(
        @PathVariable String id,
        @Valid @RequestBody UpdateNotificationRequest request,
        Authentication authentication
    ) {
        return notificationService.update(id, request, authentication);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse patchRead(
        @PathVariable String id,
        @Valid @RequestBody PatchNotificationReadRequest request,
        Authentication authentication
    ) {
        return notificationService.patchRead(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id, Authentication authentication) {
        notificationService.delete(id, authentication);
    }
}
