package com.frauddetection.repository;

import com.frauddetection.model.RiskLevel;
import com.frauddetection.model.TransactionRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionRecord, Long> {

    boolean existsByTransactionId(String transactionId);

    java.util.Optional<TransactionRecord> findByTransactionId(String transactionId);

    boolean existsByOrganizationIdAndTransactionId(String organizationId, String transactionId);

    Page<TransactionRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<TransactionRecord> findAllByOrganizationIdOrderByCreatedAtDesc(String organizationId, Pageable pageable);

    long countByIsFraudTrue();

    long countByOrganizationIdAndIsFraudTrue(String organizationId);

    long countByRiskLevel(RiskLevel riskLevel);

    long countByOrganizationIdAndRiskLevel(String organizationId, RiskLevel riskLevel);

    long countByOrganizationId(String organizationId);

    @Query("SELECT AVG(t.amount) FROM TransactionRecord t WHERE t.userId = :userId")
    Double findAverageAmountByUserId(@Param("userId") String userId);

    @Query("SELECT AVG(t.amount) FROM TransactionRecord t WHERE t.organizationId = :organizationId AND t.userId = :userId")
    Double findAverageAmountByOrganizationIdAndUserId(@Param("organizationId") String organizationId, @Param("userId") String userId);

    @Query("SELECT COUNT(t) FROM TransactionRecord t WHERE t.userId = :userId AND t.createdAt >= :since")
    long countRecentTransactionsForUser(@Param("userId") String userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM TransactionRecord t WHERE t.organizationId = :organizationId AND t.userId = :userId AND t.createdAt >= :since")
    long countRecentTransactionsForUser(@Param("organizationId") String organizationId, @Param("userId") String userId, @Param("since") LocalDateTime since);

    List<TransactionRecord> findTop10ByUserIdOrderByCreatedAtDesc(String userId);

    List<TransactionRecord> findTop10ByOrganizationIdAndUserIdOrderByCreatedAtDesc(String organizationId, String userId);

    List<TransactionRecord> findTop50ByUserIdOrderByCreatedAtDesc(String userId);

    List<TransactionRecord> findTop50ByOrganizationIdAndUserIdOrderByCreatedAtDesc(String organizationId, String userId);

    List<TransactionRecord> findTop10ByOrderByCreatedAtDesc();

    List<TransactionRecord> findTop10ByOrganizationIdOrderByCreatedAtDesc(String organizationId);

    List<TransactionRecord> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);

    List<TransactionRecord> findByOrganizationIdAndCreatedAtAfterOrderByCreatedAtDesc(String organizationId, LocalDateTime since);

    @Query("SELECT t.merchantCategory, COUNT(t) FROM TransactionRecord t WHERE t.isFraud = true GROUP BY t.merchantCategory")
    List<Object[]> countFraudByCategory();

    @Query("SELECT t.merchantCategory, COUNT(t) FROM TransactionRecord t WHERE t.organizationId = :organizationId AND t.isFraud = true GROUP BY t.merchantCategory")
    List<Object[]> countFraudByCategory(@Param("organizationId") String organizationId);

    @Query("SELECT t.hourOfDay, COUNT(t) FROM TransactionRecord t WHERE t.isFraud = true GROUP BY t.hourOfDay ORDER BY t.hourOfDay")
    List<Object[]> countFraudByHour();

    @Query("SELECT t.hourOfDay, COUNT(t) FROM TransactionRecord t WHERE t.organizationId = :organizationId AND t.isFraud = true GROUP BY t.hourOfDay ORDER BY t.hourOfDay")
    List<Object[]> countFraudByHour(@Param("organizationId") String organizationId);

    List<TransactionRecord> findByOrganizationId(String organizationId);

    @Modifying
    @Query("DELETE FROM TransactionRecord t WHERE t.organizationId = :organizationId")
    void deleteByOrganizationId(@Param("organizationId") String organizationId);

    @Modifying
    @Query("DELETE FROM TransactionRecord t WHERE t.organizationId = :organizationId AND t.createdAt < :cutoff")
    void deleteByOrganizationIdAndCreatedAtBefore(@Param("organizationId") String organizationId, @Param("cutoff") LocalDateTime cutoff);
}
