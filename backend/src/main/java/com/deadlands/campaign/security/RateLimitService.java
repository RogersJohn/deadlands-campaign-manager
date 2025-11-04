package com.deadlands.campaign.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to handle rate limiting using token bucket algorithm.
 * Prevents API abuse by limiting requests per IP address.
 */
@Service
public class RateLimitService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    /**
     * Resolve a bucket for the given IP address.
     * Each IP gets its own bucket with rate limit of 100 requests per minute.
     *
     * @param ip The client IP address
     * @return Bucket for rate limiting
     */
    public Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, k -> createNewBucket());
    }

    /**
     * Resolve a bucket for login attempts.
     * More restrictive: 10 attempts per hour per IP.
     *
     * @param ip The client IP address
     * @return Bucket for rate limiting login attempts
     */
    public Bucket resolveLoginBucket(String ip) {
        String loginKey = "login:" + ip;
        return cache.computeIfAbsent(loginKey, k -> createLoginBucket());
    }

    /**
     * Create a new bucket with general API rate limit.
     * Allows 100 requests per minute with refill rate of 100 tokens per minute.
     */
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Create a bucket for login rate limiting.
     * More restrictive: 10 attempts per hour.
     */
    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofHours(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Check if a request is allowed for the given IP.
     *
     * @param ip The client IP address
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean tryConsume(String ip) {
        Bucket bucket = resolveBucket(ip);
        return bucket.tryConsume(1);
    }

    /**
     * Check if a login attempt is allowed for the given IP.
     *
     * @param ip The client IP address
     * @return true if login attempt is allowed, false if rate limit exceeded
     */
    public boolean tryConsumeLogin(String ip) {
        Bucket bucket = resolveLoginBucket(ip);
        return bucket.tryConsume(1);
    }

    /**
     * Clear rate limit cache (useful for testing or manual reset).
     */
    public void clearCache() {
        cache.clear();
    }
}
