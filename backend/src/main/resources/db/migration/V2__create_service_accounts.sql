-- Migration: Service-to-Service Authentication
-- Description: Create tables for OAuth2 client_credentials flow

-- Service accounts table
CREATE TABLE IF NOT EXISTS service_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL UNIQUE,
    client_secret_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_service_name (service_name),
    INDEX idx_is_active (is_active)
);

-- Service account scopes table
CREATE TABLE IF NOT EXISTS service_account_scopes (
    service_account_id BIGINT NOT NULL,
    scope VARCHAR(255) NOT NULL,
    FOREIGN KEY (service_account_id) REFERENCES service_accounts(id) ON DELETE CASCADE,
    INDEX idx_service_account_id (service_account_id)
);

-- Example: Create RAG service account
-- Note: Replace 'your-bcrypt-hash-here' with actual BCrypt hash
-- Generate hash: BCryptPasswordEncoder().encode("your-secret")
/*
INSERT INTO service_accounts (service_name, client_id, client_secret_hash, is_active)
VALUES (
    'rag-service',
    'rag-service-client-id',
    '$2a$10$your-bcrypt-hash-here',
    TRUE
);

INSERT INTO service_account_scopes (service_account_id, scope)
VALUES 
    (LAST_INSERT_ID(), 'RAG_READ'),
    (LAST_INSERT_ID(), 'RAG_SYNC'),
    (LAST_INSERT_ID(), 'HEALTH_CHECK');
*/
