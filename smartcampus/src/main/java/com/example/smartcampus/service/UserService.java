package com.example.smartcampus.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.example.smartcampus.dto.user.CreateUserRequest;
import com.example.smartcampus.dto.user.PatchRolesRequest;
import com.example.smartcampus.dto.user.ReplaceRolesRequest;
import com.example.smartcampus.dto.user.SignUpRequest;
import com.example.smartcampus.dto.user.UserResponse;
import com.example.smartcampus.exception.DuplicateResourceException;
import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.model.AuthProvider;
import com.example.smartcampus.model.Role;
import com.example.smartcampus.model.User;
import com.example.smartcampus.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Set<String> bootstrapAdminEmails;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.security.bootstrap-admin-emails:}") String bootstrapAdminEmails
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapAdminEmails = parseEmails(bootstrapAdminEmails);
    }

    public User syncOAuthUser(OAuth2User oauth2User) {
        String email = normalizeEmail(extractEmailFromAttributes(oauth2User.getAttributes()));
        Instant now = Instant.now();
        String providerId = oauth2User.getName();

        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        boolean isNewUser = user.getId() == null;

        user.setEmail(email);
        user.setDisplayName((String) oauth2User.getAttributes().getOrDefault("name", email));
        user.setAvatarUrl((String) oauth2User.getAttributes().get("picture"));
        user.setProvider(AuthProvider.GOOGLE);
        user.setProviderId(providerId);
        user.setPassword(null);
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);

        if (isNewUser) {
            user.setCreatedAt(now);
            user.setRoles(new HashSet<>(Set.of(Role.USER)));
        }

        if (bootstrapAdminEmails.contains(email)) {
            user.getRoles().add(Role.ADMIN);
        }

        if (user.getRoles().isEmpty()) {
            user.getRoles().add(Role.USER);
        }

        return userRepository.save(user);
    }

    public UserResponse createUser(CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("User with email already exists: " + email);
        }

        Instant now = Instant.now();
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(request.displayName());
        user.setAvatarUrl(request.avatarUrl());
        user.setProvider(AuthProvider.LOCAL);
        user.setProviderId(null);
        user.setPassword(null);
        user.setRoles(new HashSet<>(request.roles()));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return toResponse(userRepository.save(user));
    }

    public UserResponse createLocalUser(SignUpRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("User with email already exists: " + email);
        }

        Instant now = Instant.now();
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(request.displayName());
        user.setAvatarUrl(null);
        user.setProvider(AuthProvider.LOCAL);
        user.setProviderId(null);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(new HashSet<>(Set.of(request.role())));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return toResponse(userRepository.save(user));
    }

    public UserResponse markLocalLogin(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + normalizedEmail));

        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse getUserById(String id) {
        return toResponse(getEntityById(id));
    }

    public UserResponse replaceRoles(String id, ReplaceRolesRequest request) {
        User user = getEntityById(id);
        user.setRoles(new HashSet<>(request.roles()));
        user.setUpdatedAt(Instant.now());
        return toResponse(userRepository.save(user));
    }

    public UserResponse patchRoles(String id, PatchRolesRequest request) {
        User user = getEntityById(id);
        Set<Role> roles = new HashSet<>(user.getRoles());

        if (request.addRoles() != null) {
            roles.addAll(request.addRoles());
        }

        if (request.removeRoles() != null) {
            roles.removeAll(request.removeRoles());
        }

        if (roles.isEmpty()) {
            throw new IllegalArgumentException("User must have at least one role");
        }

        user.setRoles(roles);
        user.setUpdatedAt(Instant.now());
        return toResponse(userRepository.save(user));
    }

    public void deleteUser(String id) {
        User user = getEntityById(id);
        userRepository.delete(user);
    }

    public UserResponse getCurrentUser(Authentication authentication) {
        User user = getCurrentUserEntity(authentication);
        return user != null ? toResponse(user) : null;
    }

    public User getCurrentUserEntity(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String email = extractEmailFromAuthentication(authentication).orElse(null);
        if (email == null) return null;

        return userRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getAuthProvider(),
            user.getProviderId(),
            user.getRoles(),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    private User getEntityById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Optional<String> extractEmailFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            return Optional.of(normalizeEmail(extractEmailFromAttributes(oauth2User.getAttributes())));
        }

        String name = authentication.getName();
        if (name != null && name.contains("@")) {
            return Optional.of(normalizeEmail(name));
        }

        return Optional.empty();
    }

    private String extractEmailFromAttributes(Map<String, Object> attributes) {
        Object emailValue = attributes.get("email");
        if (emailValue == null) {
            throw new IllegalArgumentException("Google OAuth response does not contain email");
        }
        return emailValue.toString();
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private Set<String> parseEmails(String rawEmails) {
        if (rawEmails == null || rawEmails.isBlank()) {
            return Set.of();
        }

        String[] values = rawEmails.split(",");
        Collection<String> emails = new ArrayList<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                emails.add(normalizeEmail(value));
            }
        }

        return Set.copyOf(emails);
    }
}
