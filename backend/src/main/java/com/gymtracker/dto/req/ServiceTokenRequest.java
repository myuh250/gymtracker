package com.gymtracker.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request DTO for OAuth2 client_credentials flow
 * Service requests token using client_id and client_secret
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTokenRequest {
    
    @NotBlank(message = "Client ID is required")
    private String clientId;
    
    @NotBlank(message = "Client secret is required")
    private String clientSecret;
    
    // OAuth2 standard: grant_type should be "client_credentials"
    @NotBlank(message = "Grant type is required")
    private String grantType;
}
