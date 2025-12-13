package com.gymtracker.service;

import com.gymtracker.dto.req.LoginRequest;
import com.gymtracker.dto.req.RegisterRequest;
import com.gymtracker.dto.res.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
