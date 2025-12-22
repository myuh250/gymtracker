package com.gymtracker.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO for service token (OAuth2 standard format)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTokenResponse {
    
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("token_type")
    private String tokenType;  // Always "Bearer"
    
    @JsonProperty("expires_in")
    private long expiresIn;  // Seconds until expiration
    
    @JsonProperty("scope")
    private String scope;  // Space-separated scopes
    
    @JsonProperty("issued_at")
    private long issuedAt;  // Unix timestamp
}
