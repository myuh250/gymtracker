package com.gymtracker.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long userId;   // Expose user ID so FE can personalize features (e.g. RAG)
    private String token;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;  // Avatar URL from OAuth2 provider or custom upload
}
