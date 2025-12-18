package com.gymtracker.config;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gymtracker.util.JwtUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filter to validate and enforce SERVICE tokens for /internal/** endpoints
 * 
 * Security rules:
 * 1. /internal/** endpoints MUST use SERVICE token
 * 2. Regular user tokens are REJECTED for /internal/** 
 * 3. Service tokens are ONLY valid for /internal/** (cannot access user endpoints)
 * 4. Scope-based authorization is enforced
 */
@Component
public class ServiceTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String requestPath = request.getRequestURI();
        final String authHeader = request.getHeader("Authorization");
        
        // Skip filter if no auth header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        
        try {
            boolean isServiceToken = jwtUtils.isServiceToken(jwt);
            boolean isInternalPath = requestPath.startsWith("/internal/");
            
            // Rule 1: /internal/** MUST use SERVICE token
            if (isInternalPath && !isServiceToken) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"error\": \"forbidden\", \"message\": \"Service token required for internal endpoints\"}"
                );
                return;
            }
            
            // Rule 2: SERVICE token can ONLY access /internal/**
            if (isServiceToken && !isInternalPath) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"error\": \"forbidden\", \"message\": \"Service tokens are only valid for internal endpoints\"}"
                );
                return;
            }
            
            // Validate and authenticate service token
            if (isServiceToken && isInternalPath) {
                if (!jwtUtils.isServiceTokenValid(jwt)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"error\": \"unauthorized\", \"message\": \"Invalid or expired service token\"}"
                    );
                    return;
                }
                
                // Extract service info and scopes
                String serviceName = jwtUtils.extractUsername(jwt);
                List<String> scopes = jwtUtils.extractScopes(jwt);
                
                // Convert scopes to Spring Security authorities
                List<SimpleGrantedAuthority> authorities = scopes.stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList();
                
                // Set authentication in SecurityContext
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        serviceName,
                        null,
                        authorities
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\": \"unauthorized\", \"message\": \"Token validation failed\"}"
            );
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
