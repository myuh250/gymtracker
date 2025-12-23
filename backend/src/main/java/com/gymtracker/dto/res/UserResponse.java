package com.gymtracker.dto.res;

import java.time.LocalDateTime;

import com.gymtracker.enums.Role;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Boolean isEnabled;
    private Boolean isOauth;
    private String oauthProvider;
    private String avatarUrl;  // Avatar URL from OAuth2 or custom upload
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
