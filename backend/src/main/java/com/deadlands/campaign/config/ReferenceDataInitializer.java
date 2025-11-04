package com.deadlands.campaign.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("disabled") // Disabled to prevent memory issues - load reference data manually
@Order(2) // Run after DatabaseInitializer
public class ReferenceDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ReferenceDataInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking if reference data initialization is needed...");

        // Check if reference data exists
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM skill_references", Integer.class);

        if (count == null || count == 0) {
            logger.info("No reference data found. Loading reference data...");
            loadReferenceData();
        } else {
            logger.info("Reference data already initialized. Found {} skill references.", count);
        }
    }

    private void loadReferenceData() {
        try {
            // Load reference-data.sql from classpath
            org.springframework.core.io.Resource resource =
                new org.springframework.core.io.ClassPathResource("reference-data.sql");

            String sql = new String(resource.getInputStream().readAllBytes());

            // Execute the SQL
            jdbcTemplate.execute(sql);

            logger.info("Reference data loaded successfully!");
        } catch (Exception e) {
            logger.error("Failed to load reference data", e);
            throw new RuntimeException("Failed to load reference data", e);
        }
    }
}
