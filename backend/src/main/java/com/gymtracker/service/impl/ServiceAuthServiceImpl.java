package com.gymtracker.service.impl;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gymtracker.dto.req.ServiceTokenRequest;
import com.gymtracker.dto.res.ServiceTokenResponse;
import com.gymtracker.entity.ServiceAccount;
import com.gymtracker.repository.ServiceAccountRepository;
import com.gymtracker.service.ServiceAuthService;
import com.gymtracker.util.JwtUtils;

@Service
public class ServiceAuthServiceImpl implements ServiceAuthService {

    @Autowired
    private ServiceAccountRepository serviceAccountRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${jwt.service-token-expiration:900000}") // 15 minutes in milliseconds
    private long serviceTokenExpiration;

    @Override
    public ServiceTokenResponse authenticateService(ServiceTokenRequest request) {
        // Validate grant_type
        if (!"client_credentials".equals(request.getGrantType())) {
            throw new IllegalArgumentException("Invalid grant_type. Must be 'client_credentials'");
        }

        // Find service account by client_id
        ServiceAccount serviceAccount = serviceAccountRepository
                .findByClientId(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid client credentials"));

        // Verify client_secret
        if (!passwordEncoder.matches(request.getClientSecret(), serviceAccount.getClientSecretHash())) {
            throw new IllegalArgumentException("Invalid client credentials");
        }

        // Check if service is active
        if (!serviceAccount.getIsActive()) {
            throw new IllegalArgumentException("Service account is inactive");
        }

        // Check if service is expired
        if (serviceAccount.getExpiresAt() != null && 
            serviceAccount.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Service account has expired");
        }

        // Extract scopes
        var scopes = serviceAccount.getScopes()
                .stream()
                .map(scope -> scope.getScope())
                .collect(Collectors.toList());

        // Generate token
        String token = jwtUtils.generateServiceToken(
                serviceAccount.getServiceName(),
                scopes
        );

        // Update last used timestamp
        serviceAccount.setLastUsedAt(LocalDateTime.now());
        serviceAccountRepository.save(serviceAccount);

        // Build response (OAuth2 standard format)
        return ServiceTokenResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(serviceTokenExpiration / 1000) // Convert to seconds
                .scope(String.join(" ", scopes))
                .issuedAt(System.currentTimeMillis() / 1000) // Unix timestamp
                .build();
    }

    @Override
    public boolean validateServiceToken(String token) {
        return jwtUtils.isServiceTokenValid(token);
    }
}
