package com.frauddetection.repository;

import com.frauddetection.model.Subscription;
import com.frauddetection.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    Optional<Subscription> findByOrganizationId(String organizationId);

    Optional<Subscription> findByProviderSubscriptionId(String providerSubscriptionId);

    List<Subscription> findByStatusAndTrialEndsAtBefore(SubscriptionStatus status, LocalDateTime cutoff);

    List<Subscription> findByStatusAndTrialEndsAtBetween(SubscriptionStatus status, LocalDateTime start, LocalDateTime end);

    void deleteByOrganizationId(String organizationId);
}
