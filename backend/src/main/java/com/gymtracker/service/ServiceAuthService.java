package com.gymtracker.service;

import com.gymtracker.dto.req.ServiceTokenRequest;
import com.gymtracker.dto.res.ServiceTokenResponse;

public interface ServiceAuthService {
    
    /**
     * Authenticate service and issue token (OAuth2 client_credentials flow)
     */
    ServiceTokenResponse authenticateService(ServiceTokenRequest request);
    
    /**
     * Validate service token
     */
    boolean validateServiceToken(String token);
}
