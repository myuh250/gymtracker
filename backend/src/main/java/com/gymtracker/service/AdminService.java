package com.gymtracker.service;

import java.util.List;

import com.gymtracker.dto.req.UserRequest;
import com.gymtracker.dto.res.UserResponse;

public interface AdminService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    UserResponse toggleUserEnabled(Long id);
}
