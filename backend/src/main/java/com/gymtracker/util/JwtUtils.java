package com.gymtracker.util;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.service-token-expiration:900000}") // Default 15 minutes
    private long serviceTokenExpiration;
    
    @Value("${jwt.issuer:gym-tracker-backend}")
    private String issuer;
    
    @Value("${jwt.audience:gym-tracker-api}")
    private String audience;    

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate short-lived service token with scope-based permissions
     * Used for inter-service authentication (OAuth2 client_credentials flow)
     * 
     * @param serviceName Service identifier
     * @param scopes List of granted scopes (e.g., ["rag:read", "rag:sync"])
     * @return JWT token
     */
    public String generateServiceToken(String serviceName, java.util.List<String> scopes) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", String.join(" ", scopes));  // OAuth2 standard: space-separated
        claims.put("type", "SERVICE");  // Distinguish from user tokens
        claims.put("client_id", serviceName);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(serviceName)
                .setIssuer(issuer)  // Who issued this token
                .setAudience(audience)  // Who should accept this token
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + serviceTokenExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract scopes from service token
     * @return List of scope strings
     */
    public java.util.List<String> extractScopes(String token) {
        String scopeString = extractClaim(token, claims -> claims.get("scope", String.class));
        if (scopeString == null || scopeString.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return java.util.Arrays.asList(scopeString.split(" "));
    }

    /**
     * Extract token type (USER or SERVICE)
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Check if token is a service token
     */
    public boolean isServiceToken(String token) {
        String type = extractTokenType(token);
        return "SERVICE".equals(type);
    }
    
    /**
     * Extract issuer from token
     */
    public String extractIssuer(String token) {
        return extractClaim(token, Claims::getIssuer);
    }
    
    /**
     * Extract audience from token
     */
    public String extractAudience(String token) {
        return extractClaim(token, Claims::getAudience);
    }
    
    /**
     * Validate service token with full checks
     * - Signature verification
     * - Expiration check
     * - Issuer/Audience validation
     * - Service type check
     */
    public boolean isServiceTokenValid(String token) {
        try {
            if (!isServiceToken(token)) {
                return false;
            }
            
            if (isTokenExpired(token)) {
                return false;
            }
            
            // Verify issuer and audience to prevent token confusion attacks
            String tokenIssuer = extractIssuer(token);
            String tokenAudience = extractAudience(token);
            
            return issuer.equals(tokenIssuer) && audience.equals(tokenAudience);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if service token has required scope
     */
    public boolean hasScope(String token, String requiredScope) {
        java.util.List<String> scopes = extractScopes(token);
        return scopes.contains(requiredScope);
    }
    
    /**
     * Extract role from token (legacy for user tokens)
     * @deprecated Use extractScopes for service tokens
     */
    @Deprecated
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }
}
