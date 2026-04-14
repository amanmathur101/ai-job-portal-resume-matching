package com.aman.springboot.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String username; 

    @NotBlank(message = "Password is required")
    private String password;

    public LoginDto() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
