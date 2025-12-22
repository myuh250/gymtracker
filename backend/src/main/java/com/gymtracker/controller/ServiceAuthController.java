package com.gymtracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtracker.dto.req.ServiceTokenRequest;
import com.gymtracker.dto.res.ServiceTokenResponse;
import com.gymtracker.service.ServiceAuthService;

import jakarta.validation.Valid;

/**
 * Service Authentication Controller
 * Implements OAuth2 client_credentials flow for service-to-service authentication
 * 
 * Endpoint: POST /api/service/token
 * 
 * Example request:
 * {
 *   "clientId": "rag-service",
 *   "clientSecret": "your-secret-here",
 *   "grantType": "client_credentials"
 * }
 * 
 * Example response:
 * {
 *   "access_token": "eyJhbG...",
 *   "token_type": "Bearer",
 *   "expires_in": 900,
 *   "scope": "rag:read rag:sync",
 *   "issued_at": 1234567890
 * }
 */
@RestController
@RequestMapping("/api/service")
public class ServiceAuthController {

    @Autowired
    private ServiceAuthService serviceAuthService;

    /**
     * OAuth2 client_credentials endpoint
     * Services use this to obtain access tokens
     */
    @PostMapping("/token")
    public ResponseEntity<?> getServiceToken(@Valid @RequestBody ServiceTokenRequest request) {
        try {
            ServiceTokenResponse response = serviceAuthService.authenticateService(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Return OAuth2 standard error response
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("invalid_client", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("server_error", "An error occurred while processing the request"));
        }
    }

    /**
     * OAuth2 standard error response
     */
    private static class ErrorResponse {
        public final String error;
        public final String errorDescription;

        public ErrorResponse(String error, String errorDescription) {
            this.error = error;
            this.errorDescription = errorDescription;
        }
    }
}
