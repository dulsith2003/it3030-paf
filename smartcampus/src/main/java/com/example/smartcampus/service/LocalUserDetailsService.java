package com.example.smartcampus.service;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.smartcampus.model.AuthProvider;
import com.example.smartcampus.repository.UserRepository;

@Service
public class LocalUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public LocalUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.example.smartcampus.model.User localUser = userRepository.findByEmailIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (localUser.getAuthProvider() != AuthProvider.LOCAL || localUser.getPasswordHash() == null) {
            throw new UsernameNotFoundException("Local credentials not available");
        }

        Set<GrantedAuthority> authorities = localUser.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
            .collect(Collectors.toSet());

        return User.builder()
            .username(localUser.getEmail())
            .password(localUser.getPasswordHash())
            .authorities(authorities)
            .build();
    }
}
