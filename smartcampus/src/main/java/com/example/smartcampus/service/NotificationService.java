package com.example.smartcampus.service;

import java.time.Instant;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.smartcampus.dto.notification.CreateNotificationRequest;
import com.example.smartcampus.dto.notification.NotificationResponse;
import com.example.smartcampus.dto.notification.PatchNotificationReadRequest;
import com.example.smartcampus.dto.notification.UpdateNotificationRequest;
import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.model.Notification;
import com.example.smartcampus.model.Role;
import com.example.smartcampus.model.User;
import com.example.smartcampus.repository.NotificationRepository;
import com.example.smartcampus.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public NotificationService(
        NotificationRepository notificationRepository,
        UserService userService,
        UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    public List<NotificationResponse> listNotifications(Authentication authentication, boolean all) {
        User actor = userService.getCurrentUserEntity(authentication);
        if (all && hasRole(actor, Role.ADMIN)) {
            return notificationRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(actor.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public NotificationResponse getById(String id, Authentication authentication) {
        User actor = userService.getCurrentUserEntity(authentication);
        Notification notification = getEntityById(id);
        enforceReadAccess(actor, notification);
        return toResponse(notification);
    }

    public NotificationResponse create(CreateNotificationRequest request, Authentication authentication) {
        User actor = userService.getCurrentUserEntity(authentication);
        String targetUserId = resolveTargetUserId(request.userId(), actor);

        Instant now = Instant.now();
        Notification notification = new Notification();
        notification.setUserId(targetUserId);
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setRead(request.read() != null ? request.read() : false);
        notification.setCreatedAt(now);
        notification.setUpdatedAt(now);

        return toResponse(notificationRepository.save(notification));
    }

    public NotificationResponse update(String id, UpdateNotificationRequest request, Authentication authentication) {
        User actor = userService.getCurrentUserEntity(authentication);
        Notification notification = getEntityById(id);
        enforceWriteAccess(actor, notification);

        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setRead(request.read() != null ? request.read() : notification.getRead());
        notification.setUpdatedAt(Instant.now());

        return toResponse(notificationRepository.save(notification));
    }

    public NotificationResponse patchRead(
        String id,
        PatchNotificationReadRequest request,
        Authentication authentication
    ) {
        User actor = userService.getCurrentUserEntity(authentication);
        Notification notification = getEntityById(id);
        enforceWriteAccess(actor, notification);

        notification.setRead(request.read());
        notification.setUpdatedAt(Instant.now());

        return toResponse(notificationRepository.save(notification));
    }

    public void delete(String id, Authentication authentication) {
        User actor = userService.getCurrentUserEntity(authentication);
        Notification notification = getEntityById(id);
        enforceWriteAccess(actor, notification);
        notificationRepository.delete(notification);
    }

    private Notification getEntityById(String id) {
        return notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    private void enforceReadAccess(User actor, Notification notification) {
        if (hasRole(actor, Role.ADMIN)) {
            return;
        }

        if (!actor.getId().equals(notification.getUserId())) {
            throw new AccessDeniedException("You are not allowed to read this notification");
        }
    }

    private void enforceWriteAccess(User actor, Notification notification) {
        if (hasRole(actor, Role.ADMIN)) {
            return;
        }

        if (!actor.getId().equals(notification.getUserId())) {
            throw new AccessDeniedException("You are not allowed to modify this notification");
        }
    }

    private String resolveTargetUserId(String requestedUserId, User actor) {
        if (requestedUserId == null || requestedUserId.isBlank()) {
            return actor.getId();
        }

        if (!hasRole(actor, Role.ADMIN) && !requestedUserId.equals(actor.getId())) {
            throw new AccessDeniedException("You can only create notifications for yourself");
        }

        userRepository.findById(requestedUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found with id: " + requestedUserId));

        return requestedUserId;
    }

    private boolean hasRole(User user, Role role) {
        return user.getRoles() != null && user.getRoles().contains(role);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getUserId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType(),
            notification.getRead(),
            notification.getCreatedAt(),
            notification.getUpdatedAt()
        );
    }
}
