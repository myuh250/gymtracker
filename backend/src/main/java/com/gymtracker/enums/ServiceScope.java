package com.gymtracker.enums;

/**
 * Service scopes for fine-grained access control
 * Each scope represents a specific capability/permission
 */
public enum ServiceScope {
    // RAG service scopes
    RAG_READ("rag:read", "Read exercise data for RAG processing"),
    RAG_SYNC("rag:sync", "Sync exercise database"),
    
    // Analytics service scopes
    ANALYTICS_READ("analytics:read", "Read analytics data"),
    ANALYTICS_WRITE("analytics:write", "Write analytics data"),
    
    // Health check scope (all services)
    HEALTH_CHECK("health:check", "Health check endpoint access"),
    
    // Admin scope (for service management)
    SERVICE_ADMIN("service:admin", "Full service administration");
    
    private final String scope;
    private final String description;
    
    ServiceScope(String scope, String description) {
        this.scope = scope;
        this.description = description;
    }
    
    public String getScope() {
        return scope;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Parse scope string to enum
     */
    public static ServiceScope fromString(String scope) {
        for (ServiceScope s : ServiceScope.values()) {
            if (s.scope.equals(scope)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown scope: " + scope);
    }
}
