package com.frauddetection.repository;

import com.frauddetection.model.ModelMetricsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModelMetricsRepository extends JpaRepository<ModelMetricsRecord, Long> {

    Optional<ModelMetricsRecord> findTopByOrderByTrainedAtDesc();

    Optional<ModelMetricsRecord> findTopByOrganizationIdOrderByTrainedAtDesc(String organizationId);
}
