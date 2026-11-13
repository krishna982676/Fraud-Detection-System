package com.frauddetection.repository;

import com.frauddetection.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, String> {

    Optional<ApiKey> findByKeyHashAndIsRevokedFalse(String keyHash);

    List<ApiKey> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);

    Optional<ApiKey> findByIdAndOrganizationId(String id, String organizationId);

    long countByOrganizationId(String organizationId);

    void deleteByOrganizationId(String organizationId);
}
