package com.frauddetection.service;

import com.frauddetection.model.ApiKey;
import com.frauddetection.repository.ApiKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApiKeyService {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    public static class GeneratedApiKey {
        private final ApiKey apiKey;
        private final String rawSecret;

        public GeneratedApiKey(ApiKey apiKey, String rawSecret) {
            this.apiKey = apiKey;
            this.rawSecret = rawSecret;
        }

        public ApiKey getApiKey() {
            return apiKey;
        }

        public String getRawSecret() {
            return rawSecret;
        }
    }

    public static String hashApiKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    @Transactional
    public GeneratedApiKey createApiKey(String organizationId, String userId, String name) {
        byte[] randomBytes = new byte[24];
        RANDOM.nextBytes(randomBytes);
        String randomHex = HexFormat.of().formatHex(randomBytes);
        String rawKey = "sx_live_" + randomHex;
        String prefix = rawKey.substring(0, 14);
        String keyHash = hashApiKey(rawKey);

        ApiKey apiKey = new ApiKey(
                UUID.randomUUID().toString(),
                organizationId,
                userId,
                name != null && !name.isBlank() ? name : "Default Production Key",
                prefix,
                keyHash
        );

        ApiKey saved = apiKeyRepository.save(apiKey);
        return new GeneratedApiKey(saved, rawKey);
    }

    public Optional<ApiKey> validateApiKey(String rawKey) {
        if (rawKey == null || !rawKey.startsWith("sx_")) {
            return Optional.empty();
        }
        String hash = hashApiKey(rawKey);
        Optional<ApiKey> keyOpt = apiKeyRepository.findByKeyHashAndIsRevokedFalse(hash);
        keyOpt.ifPresent(apiKey -> {
            apiKey.setLastUsedAt(LocalDateTime.now());
            apiKeyRepository.save(apiKey);
        });
        return keyOpt;
    }

    public List<ApiKey> getApiKeysForOrg(String organizationId) {
        return apiKeyRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
    }

    @Transactional
    public boolean revokeApiKey(String id, String organizationId) {
        Optional<ApiKey> keyOpt = apiKeyRepository.findByIdAndOrganizationId(id, organizationId);
        if (keyOpt.isPresent()) {
            ApiKey key = keyOpt.get();
            key.setIsRevoked(true);
            apiKeyRepository.save(key);
            return true;
        }
        return false;
    }
}
