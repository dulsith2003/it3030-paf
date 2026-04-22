package com.example.smartcampus.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.smartcampus.service.UserService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;

    public OAuth2LoginSuccessHandler(
        UserService userService,
        @Value("${app.security.oauth2-success-redirect:http://localhost:5173/oauth-success}") String successRedirect
    ) {
        this.userService = userService;
        setDefaultTargetUrl(successRedirect);
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            userService.syncOAuthUser(oauth2User);
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, getDefaultTargetUrl());
    }
}