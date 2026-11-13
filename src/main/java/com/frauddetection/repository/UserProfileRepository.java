package com.frauddetection.repository;

import com.frauddetection.model.UserProfileRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfileRecord, Long> {

    Optional<UserProfileRecord> findByOrganizationIdAndUserId(String organizationId, String userId);

    void deleteByOrganizationId(String organizationId);
}
