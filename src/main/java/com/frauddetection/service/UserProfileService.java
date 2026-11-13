package com.frauddetection.service;

import com.frauddetection.dto.UserProfileDto;
import com.frauddetection.model.TransactionRecord;
import com.frauddetection.repository.TransactionRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    private final TransactionRepository transactionRepository;

    public static class CityCoordinate {
        public final double lat;
        public final double lon;

        public CityCoordinate(double lat, double lon) {
            this.lat = lat;
            this.lon = lon;
        }
    }

    public static final Map<String, CityCoordinate> CITY_COORDINATES = Map.ofEntries(
            // India & Major Metro Nodes
            Map.entry("INDIA", new CityCoordinate(28.6139, 77.2090)),
            Map.entry("NEW_DELHI", new CityCoordinate(28.6139, 77.2090)),
            Map.entry("DELHI", new CityCoordinate(28.6139, 77.2090)),
            Map.entry("MUMBAI", new CityCoordinate(19.0760, 72.8777)),
            Map.entry("BENGALURU", new CityCoordinate(12.9716, 77.5946)),
            Map.entry("BANGALORE", new CityCoordinate(12.9716, 77.5946)),
            Map.entry("HYDERABAD", new CityCoordinate(17.3850, 78.4867)),
            Map.entry("CHENNAI", new CityCoordinate(13.0827, 80.2707)),
            Map.entry("KOLKATA", new CityCoordinate(22.5726, 88.3639)),
            Map.entry("PUNE", new CityCoordinate(18.5204, 73.8567)),
            Map.entry("AHMEDABAD", new CityCoordinate(23.0225, 72.5714)),
            Map.entry("JAIPUR", new CityCoordinate(26.9124, 75.7873)),
            Map.entry("CHANDIGARH", new CityCoordinate(30.7333, 76.7794)),
            Map.entry("LUCKNOW", new CityCoordinate(26.8467, 80.9462)),
            Map.entry("KOCHI", new CityCoordinate(9.9312, 76.2673)),
            Map.entry("GOA", new CityCoordinate(15.2993, 74.1240)),
            // Global Metro Nodes
            Map.entry("NEW_YORK", new CityCoordinate(40.7128, -74.0060)),
            Map.entry("LONDON", new CityCoordinate(51.5074, -0.1278)),
            Map.entry("TOKYO", new CityCoordinate(35.6762, 139.6503)),
            Map.entry("PARIS", new CityCoordinate(48.8566, 2.3522)),
            Map.entry("SYDNEY", new CityCoordinate(-33.8688, 151.2093)),
            Map.entry("BERLIN", new CityCoordinate(52.5200, 13.4050)),
            Map.entry("TORONTO", new CityCoordinate(43.6532, -79.3832)),
            Map.entry("DUBAI", new CityCoordinate(25.2048, 55.2708)),
            Map.entry("SINGAPORE", new CityCoordinate(1.3521, 103.8198)),
            Map.entry("SAN_FRANCISCO", new CityCoordinate(37.7749, -122.4194)),
            Map.entry("LOS_ANGELES", new CityCoordinate(34.0522, -118.2437)),
            Map.entry("CHICAGO", new CityCoordinate(41.8781, -87.6298)),
            Map.entry("SEATTLE", new CityCoordinate(47.6062, -122.3321)),
            Map.entry("BOSTON", new CityCoordinate(42.3601, -71.0589))
    );

    public static CityCoordinate getCityCoordinate(String city) {
        if (city == null) return null;
        String raw = city.trim().toUpperCase();
        CityCoordinate coord = CITY_COORDINATES.get(raw);
        if (coord != null) return coord;
        String normalized = raw.replaceAll("[\\s\\-_]+", "_");
        coord = CITY_COORDINATES.get(normalized);
        if (coord != null) return coord;
        if (normalized.equals("DELHI") || normalized.equals("NEW_DELHI") || normalized.equals("INDIA")) {
            return CITY_COORDINATES.get("NEW_DELHI");
        }
        if (normalized.equals("BANGALORE") || normalized.equals("BENGALURU")) {
            return CITY_COORDINATES.get("BENGALURU");
        }
        return null;
    }

    public static class InternalUserProfile {
        private double sumAmount = 0.0;
        private double sumSqAmount = 0.0;
        private long count = 0;
        private final Map<String, Integer> cityCounts = new HashMap<>();
        private final Map<String, Integer> categoryCounts = new HashMap<>();
        private final Set<String> knownDevices = new HashSet<>();
        private final Set<Integer> activeHours = new HashSet<>();
        private String lastLocation;
        private LocalDateTime lastTxnTime;
        private final Deque<LocalDateTime> recentTxnTimes = new ArrayDeque<>();

        public InternalUserProfile(String userId) {
        }

        public synchronized void recordTransaction(double amount, String city, String category,
                String device, int hour, LocalDateTime timestamp) {
            this.sumAmount += amount;
            this.sumSqAmount += (amount * amount);
            this.count++;

            cityCounts.put(city, cityCounts.getOrDefault(city, 0) + 1);
            categoryCounts.put(category, categoryCounts.getOrDefault(category, 0) + 1);
            if (device != null)
                knownDevices.add(device);
            activeHours.add(hour);

            this.lastLocation = city;
            this.lastTxnTime = timestamp;

            recentTxnTimes.addLast(timestamp);
            // Evict transactions older than 10 minutes from the velocity window
            LocalDateTime cutoff = timestamp.minusMinutes(10);
            while (!recentTxnTimes.isEmpty() && recentTxnTimes.peekFirst().isBefore(cutoff)) {
                recentTxnTimes.removeFirst();
            }
        }

        public synchronized double getMeanAmount() {
            return count > 0 ? (sumAmount / count) : 0.0;
        }

        public synchronized double getStdDevAmount() {
            if (count < 2)
                return getMeanAmount() * 0.4;
            double variance = (sumSqAmount - (sumAmount * sumAmount) / count) / (count - 1);
            return Math.sqrt(Math.max(0.01, variance));
        }

        public synchronized int getVelocityLast10Minutes(LocalDateTime now) {
            LocalDateTime cutoff = now.minusMinutes(10);
            while (!recentTxnTimes.isEmpty() && recentTxnTimes.peekFirst().isBefore(cutoff)) {
                recentTxnTimes.removeFirst();
            }
            return recentTxnTimes.size();
        }

        public synchronized boolean isUsualCity(String city) {
            if (cityCounts.isEmpty())
                return true;
            return cityCounts.containsKey(city);
        }

        public synchronized boolean isKnownDevice(String device) {
            if (knownDevices.isEmpty())
                return true;
            return knownDevices.contains(device);
        }

        public synchronized boolean isUnusualHour(int hour) {
            if (activeHours.size() < 3)
                return false;
            // Unusual if user never transacts at this hour and it is nocturnal (1-5 AM)
            return !activeHours.contains(hour) && (hour >= 1 && hour <= 5);
        }

        public String getLastLocation() {
            return lastLocation;
        }

        public LocalDateTime getLastTxnTime() {
            return lastTxnTime;
        }

        public long getCount() {
            return count;
        }

        public List<String> getUsualCities() {
            return new ArrayList<>(cityCounts.keySet());
        }

        public List<String> getUsualCategories() {
            return new ArrayList<>(categoryCounts.keySet());
        }
    }

    private final Map<String, InternalUserProfile> profiles = new ConcurrentHashMap<>();

    public UserProfileService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @PostConstruct
    public void init() {
        try {
            List<TransactionRecord> recent = transactionRepository.findAll();
            log.info("Warming user profile cache from {} historical transactions in H2...", recent.size());
            for (TransactionRecord t : recent) {
                InternalUserProfile p = profiles.computeIfAbsent(t.getUserId(), InternalUserProfile::new);
                p.recordTransaction(t.getAmount(), t.getLocation(), t.getMerchantCategory(),
                        t.getDeviceType(), t.getHourOfDay(), t.getCreatedAt());
            }
        } catch (Exception e) {
            log.warn("Could not warm user profile cache: {}", e.getMessage());
        }
    }

    public InternalUserProfile getOrCreateProfile(String userId) {
        return profiles.computeIfAbsent(userId, InternalUserProfile::new);
    }

    public void recordTransaction(String userId, double amount, String city, String category,
            String device, int hour, LocalDateTime timestamp) {
        InternalUserProfile profile = getOrCreateProfile(userId);
        profile.recordTransaction(amount, city, category, device, hour,
                timestamp != null ? timestamp : LocalDateTime.now());
    }

    public UserProfileDto getProfileDto(String userId) {
        InternalUserProfile p = profiles.get(userId);
        if (p == null) {
            return new UserProfileDto(userId, 0.0, 0.0, 0, List.of(), List.of(), null, null);
        }
        return new UserProfileDto(
                userId,
                Math.round(p.getMeanAmount() * 100.0) / 100.0,
                Math.round(p.getStdDevAmount() * 100.0) / 100.0,
                p.getCount(),
                p.getUsualCities(),
                p.getUsualCategories(),
                p.getLastLocation(),
                p.getLastTxnTime());
    }

    public static double calculateHaversineDistanceKm(String city1, String city2) {
        if (city1 == null || city2 == null || city1.equalsIgnoreCase(city2)) {
            return 0.0;
        }
        CityCoordinate c1 = getCityCoordinate(city1);
        CityCoordinate c2 = getCityCoordinate(city2);

        if (c1 == null || c2 == null) {
            return 1500.0; // Default estimate between unknown locations
        }

        double earthRadius = 6371.0;
        double dLat = Math.toRadians(c2.lat - c1.lat);
        double dLon = Math.toRadians(c2.lon - c1.lon);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(c1.lat)) * Math.cos(Math.toRadians(c2.lat)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    public static double calculateImpliedSpeedKmH(String city1, LocalDateTime t1, String city2, LocalDateTime t2) {
        if (city1 == null || city2 == null || t1 == null || t2 == null) {
            return 0.0;
        }
        double distanceKm = calculateHaversineDistanceKm(city1, city2);
        if (distanceKm < 50.0) {
            return 0.0;
        }
        long seconds = Math.abs(ChronoUnit.SECONDS.between(t1, t2));
        if (seconds == 0) {
            return 99999.0; // Instantaneous jump to a different city!
        }
        double hours = seconds / 3600.0;
        return distanceKm / hours;
    }
}
