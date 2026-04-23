package com.example.smartcampus.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import com.example.smartcampus.dto.user.SignInRequest;
import com.example.smartcampus.dto.user.SignUpRequest;
import com.example.smartcampus.dto.user.UserResponse;
import com.example.smartcampus.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/login/google")
    public ResponseEntity<Map<String, String>> getGoogleLoginUrl() {
        return ResponseEntity.ok(Map.of("url", "/oauth2/authorization/google"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> currentUser(Authentication authentication) {
        UserResponse user = userService.getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        UserResponse createdUser = userService.createLocalUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/signin")
    public UserResponse signIn(@Valid @RequestBody SignInRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return userService.markLocalLogin(authentication.getName());
    }

    @PostMapping("/fix-password")
    public UserResponse fixPassword(@RequestBody Map<String, String> request) {
        return userService.fixLocalPassword(request.get("email"), request.get("password"));
    }
}
