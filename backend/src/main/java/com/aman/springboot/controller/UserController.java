package com.aman.springboot.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import com.aman.springboot.dto.LoginDto;
import com.aman.springboot.dto.UserDto;
import com.aman.springboot.dto.UserResponseDto;
import com.aman.springboot.model.User;
import com.aman.springboot.service.EmailService;
import com.aman.springboot.service.JwtService;
import com.aman.springboot.service.UserService;

import java.util.Map;

@RequestMapping("/api/users")
@RestController
public class UserController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserDto userDto) {
        String role = userDto.getRole() != null ? userDto.getRole().toUpperCase() : "USER";

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(userDto.getPassword());
        user.setEmail(userDto.getEmail());
        user.setRole(role);

    
        User saved = service.saveUser(user);

  
        try {
            String subject = "Welcome to Job Portal!";
            String body = String.format(
                "Hello %s,\n\nThank you for registering as a %s. We're excited to have you!\n\nBest regards,\nJob Portal Team",
                saved.getUsername(), role);
            emailService.sendEmail(saved.getEmail(), subject, body);
        } catch (Exception e) {
            log.warn("Welcome email failed for {}: {}", saved.getEmail(), e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserResponseDto(saved.getEmail(), saved.getUsername(), saved.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword())
            );

            User user = service.findByEmail(loginDto.getUsername());
            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            return ResponseEntity.ok(Map.of("token", token));

        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password."));
        }
    }
}
