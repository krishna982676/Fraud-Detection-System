package com.frauddetection.repository;

import com.frauddetection.model.Alert;
import com.frauddetection.model.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByStatusOrderByLastEventAtDesc(AlertStatus status);

    List<Alert> findByOrganizationIdAndStatusOrderByLastEventAtDesc(String organizationId, AlertStatus status);

    List<Alert> findByStatusInOrderByLastEventAtDesc(Collection<AlertStatus> statuses);

    List<Alert> findByOrganizationIdAndStatusInOrderByLastEventAtDesc(String organizationId, Collection<AlertStatus> statuses);

    List<Alert> findAllByOrderByLastEventAtDesc();

    List<Alert> findAllByOrganizationIdOrderByLastEventAtDesc(String organizationId);

    long countByStatus(AlertStatus status);

    long countByOrganizationIdAndStatus(String organizationId, AlertStatus status);

    long countByOrganizationId(String organizationId);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.lastEventAt >= :since")
    long countAlertsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.organizationId = :organizationId AND a.lastEventAt >= :since")
    long countAlertsSince(@Param("organizationId") String organizationId, @Param("since") LocalDateTime since);

    Optional<Alert> findTopByUserIdAndStatusInAndLastEventAtAfterOrderByLastEventAtDesc(
            String userId, Collection<AlertStatus> statuses, LocalDateTime since
    );

    Optional<Alert> findTopByOrganizationIdAndUserIdAndStatusInAndLastEventAtAfterOrderByLastEventAtDesc(
            String organizationId, String userId, Collection<AlertStatus> statuses, LocalDateTime since
    );

    List<Alert> findByStatusAndCreatedAtBefore(AlertStatus status, LocalDateTime threshold);

    List<Alert> findByOrganizationIdAndStatusAndCreatedAtBefore(String organizationId, AlertStatus status, LocalDateTime threshold);

    List<Alert> findTop50ByOrderByLastEventAtDesc();

    List<Alert> findTop50ByOrganizationIdOrderByLastEventAtDesc(String organizationId);

    List<Alert> findByOrganizationId(String organizationId);

    @Modifying
    @Query("DELETE FROM Alert a WHERE a.organizationId = :organizationId")
    void deleteByOrganizationId(@Param("organizationId") String organizationId);
}
