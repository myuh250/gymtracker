package com.gymtracker.service;

import com.gymtracker.dto.res.UserResponse;

/**
 * User Service
 * Provides user profile operations
 */
public interface UserService {
    UserResponse getUserById(Long id);
}
