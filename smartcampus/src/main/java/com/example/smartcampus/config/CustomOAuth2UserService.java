package com.example.smartcampus.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.example.smartcampus.model.User;
import com.example.smartcampus.service.UserService;

@Component
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = delegate.loadUser(userRequest);
        User persistedUser = userService.syncOAuthUser(oauthUser);

        Set<GrantedAuthority> authorities = new HashSet<>(oauthUser.getAuthorities());
        persistedUser.getRoles().forEach(role ->
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );

        String nameKey = userRequest.getClientRegistration()
            .getProviderDetails()
            .getUserInfoEndpoint()
            .getUserNameAttributeName();

        if (nameKey == null || nameKey.isBlank()) {
            nameKey = "sub";
        }

        return new DefaultOAuth2User(authorities, oauthUser.getAttributes(), nameKey);
    }
}
