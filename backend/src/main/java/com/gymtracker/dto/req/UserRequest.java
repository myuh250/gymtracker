package com.gymtracker.dto.req;

import com.gymtracker.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password; // Optional for updates
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;
    
    private Role role;
    private Boolean isEnabled;
}
