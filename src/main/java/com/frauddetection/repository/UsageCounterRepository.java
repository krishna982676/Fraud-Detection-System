package com.frauddetection.repository;

import com.frauddetection.model.UsageCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsageCounterRepository extends JpaRepository<UsageCounter, Long> {

    Optional<UsageCounter> findByOrganizationIdAndYearMonth(String organizationId, String yearMonth);

    @Modifying
    @Query("UPDATE UsageCounter u SET u.txnCount = u.txnCount + :delta, u.updatedAt = CURRENT_TIMESTAMP WHERE u.organizationId = :organizationId AND u.yearMonth = :yearMonth")
    int incrementCount(@Param("organizationId") String organizationId, @Param("yearMonth") String yearMonth, @Param("delta") long delta);

    List<UsageCounter> findByOrganizationIdOrderByYearMonthDesc(String organizationId);

    void deleteByOrganizationId(String organizationId);
}
