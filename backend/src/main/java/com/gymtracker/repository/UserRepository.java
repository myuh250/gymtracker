package com.gymtracker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymtracker.entity.User;
import com.gymtracker.enums.Role;

/**
 * Repository interface for User entity
 * Provides database operations for User management
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email
     * @param email User's email
     * @return Optional of User
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email
     * @param email User's email
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find user by OAuth ID and provider
     * @param oauthId OAuth ID from provider
     * @param oauthProvider OAuth provider name
     * @return Optional of User
     */
    Optional<User> findByOauthIdAndOauthProvider(String oauthId, String oauthProvider);
    
    /**
     * Find user by refresh token
     * @param refreshToken Refresh token
     * @return Optional of User
     */
    Optional<User> findByRefreshToken(String refreshToken);
    
    /**
     * Count users by role
     * @param role User role
     * @return Count of users
     */
    long countByRole(Role role);
}

