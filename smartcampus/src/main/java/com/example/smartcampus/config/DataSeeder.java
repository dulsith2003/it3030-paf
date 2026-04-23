package com.example.smartcampus.config;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.smartcampus.model.AuthProvider;
import com.example.smartcampus.model.Role;
import com.example.smartcampus.model.User;
import com.example.smartcampus.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setDisplayName("Admin");
            admin.setPassword(passwordEncoder.encode("adminpass"));
            admin.setProvider(AuthProvider.LOCAL);
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(Role.ADMIN);
            adminRoles.add(Role.USER);
            admin.setRoles(adminRoles);
            admin.setCreatedAt(Instant.now());
            userRepository.save(admin);

            User user = new User();
            user.setEmail("user@example.com");
            user.setDisplayName("User");
            user.setPassword(passwordEncoder.encode("userpass"));
            user.setProvider(AuthProvider.LOCAL);
            Set<Role> userRoles = new HashSet<>();
            userRoles.add(Role.USER);
            user.setRoles(userRoles);
            user.setCreatedAt(Instant.now());
            userRepository.save(user);
        }
    }
}
