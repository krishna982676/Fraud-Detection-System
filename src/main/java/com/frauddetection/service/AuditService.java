package com.frauddetection.service;

import com.frauddetection.model.AuditLog;
import com.frauddetection.repository.AuditLogRepository;
import com.frauddetection.security.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String organizationId, String userId, String action, String resourceType, String resourceId, String ipAddress, String details) {
        try {
            AuditLog audit = new AuditLog(
                    organizationId != null ? organizationId : TenantContext.getOrganizationId(),
                    userId != null ? userId : TenantContext.getUserId(),
                    action,
                    resourceType,
                    resourceId,
                    ipAddress,
                    details
            );
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.warn("Failed to write audit log: {}", e.getMessage());
        }
    }

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "unknown";
    }
}
