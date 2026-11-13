package com.frauddetection.repository;

import com.frauddetection.model.DemoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface DemoRequestRepository extends JpaRepository<DemoRequest, Long> {
    long countByBusinessEmailAndCreatedAtAfter(String businessEmail, Instant after);
}

