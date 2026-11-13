package com.frauddetection.security;

import com.frauddetection.model.Role;

public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();
    private static final ThreadLocal<Role> CURRENT_ROLE = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_API_KEY = new ThreadLocal<>();

    private TenantContext() {}

    public static void setOrganizationId(String organizationId) {
        CURRENT_TENANT.set(organizationId);
    }

    public static String getOrganizationId() {
        return CURRENT_TENANT.get();
    }

    public static void setUserId(String userId) {
        CURRENT_USER.set(userId);
    }

    public static String getUserId() {
        return CURRENT_USER.get();
    }

    public static void setRole(Role role) {
        CURRENT_ROLE.set(role);
    }

    public static Role getRole() {
        return CURRENT_ROLE.get();
    }

    public static void setApiKeyId(String apiKeyId) {
        CURRENT_API_KEY.set(apiKeyId);
    }

    public static String getApiKeyId() {
        return CURRENT_API_KEY.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_USER.remove();
        CURRENT_ROLE.remove();
        CURRENT_API_KEY.remove();
    }
}
