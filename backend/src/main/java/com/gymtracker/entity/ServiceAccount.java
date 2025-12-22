package com.gymtracker.entity;

import java.time.LocalDateTime;
import java.util.Set;

import com.gymtracker.enums.ServiceScope;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Service Account Entity for inter-service authentication
 * Uses client_credentials OAuth2 flow
 */
@Entity
@Table(name = "service_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceAccount extends BaseEntity {
    
    @Column(name = "service_name", unique = true, nullable = false)
    private String serviceName;  
    
    /**
     * Client ID for OAuth2 client_credentials flow
     * Should be UUID or similar unique identifier
     */
    @Column(name = "client_id", unique = true, nullable = false)
    private String clientId;
    
    /**
     * Hashed client secret (BCrypt)
     * Never store plain text secrets
     */
    @Column(name = "client_secret_hash", nullable = false)
    private String clientSecretHash;
    
    /**
     * Scopes granted to this service
     * e.g., ["rag:read", "rag:sync"]
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "service_account_scopes",
        joinColumns = @JoinColumn(name = "service_account_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "scope")
    private Set<ServiceScope> scopes;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    /**
     * Optional: Service account expiration
     * For temporary access or testing
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
}
