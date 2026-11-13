package com.frauddetection.repository;

import com.frauddetection.model.AnalystFeedbackRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalystFeedbackRepository extends JpaRepository<AnalystFeedbackRecord, Long> {

    List<AnalystFeedbackRecord> findAllByOrderByCreatedAtDesc();

    List<AnalystFeedbackRecord> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);

    List<AnalystFeedbackRecord> findByOrganizationId(String organizationId);

    long countByOrganizationId(String organizationId);

    @Modifying
    @Query("DELETE FROM AnalystFeedbackRecord f WHERE f.organizationId = :organizationId")
    void deleteByOrganizationId(@Param("organizationId") String organizationId);
}
