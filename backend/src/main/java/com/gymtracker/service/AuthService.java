package com.gymtracker.service;

import com.gymtracker.dto.req.ForgotPasswordRequest;
import com.gymtracker.dto.req.LoginRequest;
import com.gymtracker.dto.req.RegisterRequest;
import com.gymtracker.dto.res.AuthResponse;
import com.gymtracker.dto.res.ForgotPasswordResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);
}
