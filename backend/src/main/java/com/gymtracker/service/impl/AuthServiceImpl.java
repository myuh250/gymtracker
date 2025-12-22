package com.gymtracker.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gymtracker.dto.req.ForgotPasswordRequest;
import com.gymtracker.dto.req.LoginRequest;
import com.gymtracker.dto.req.RegisterRequest;
import com.gymtracker.dto.res.AuthResponse;
import com.gymtracker.dto.res.ForgotPasswordResponse;
import com.gymtracker.entity.User;
import com.gymtracker.enums.Role;
import com.gymtracker.repository.UserRepository;
import com.gymtracker.service.AuthService;
import com.gymtracker.util.JwtUtils;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        userRepository.save(user);

        // Generate token
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );
        
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .userId(user.getId())
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Check if user exists first
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại, vui lòng đăng ký"));

        // Check if user is blocked
        if (!user.getIsEnabled()) {
            throw new RuntimeException("Tài khoản đã bị chặn. Vui lòng liên hệ với admin");
        }

        // Now authenticate
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new RuntimeException("Sai mật khẩu");
        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new RuntimeException("Tài khoản đã bị chặn. Vui lòng liên hệ với admin");
        }

        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );
        
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .userId(user.getId())
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        // Directly update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ForgotPasswordResponse.builder()
                .message("Đã đổi mật khẩu thành công")
                .build();
    }


}
