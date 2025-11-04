package com.deadlands.campaign.config;

import com.deadlands.campaign.model.User;
import com.deadlands.campaign.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Profile("production")
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking if database initialization is needed...");

        // Check if any users exist
        long userCount = userRepository.count();

        if (userCount == 0) {
            logger.info("No users found. Initializing database with default users...");
            initializeUsers();
        } else {
            logger.info("Database already initialized. Found {} users.", userCount);
        }
    }

    private void initializeUsers() {
        // Create Game Master
        User gameMaster = new User();
        gameMaster.setUsername("gamemaster");
        gameMaster.setEmail("gm@deadlands.com");
        gameMaster.setPassword(passwordEncoder.encode("password123"));
        gameMaster.setRole("GAME_MASTER");
        gameMaster.setActive(true);
        gameMaster.setCreatedAt(LocalDateTime.now());
        gameMaster.setUpdatedAt(LocalDateTime.now());
        userRepository.save(gameMaster);
        logger.info("Created user: gamemaster");

        // Create Player 1
        User player1 = new User();
        player1.setUsername("player1");
        player1.setEmail("player1@deadlands.com");
        player1.setPassword(passwordEncoder.encode("password123"));
        player1.setRole("PLAYER");
        player1.setActive(true);
        player1.setCreatedAt(LocalDateTime.now());
        player1.setUpdatedAt(LocalDateTime.now());
        userRepository.save(player1);
        logger.info("Created user: player1");

        // Create Player 2
        User player2 = new User();
        player2.setUsername("player2");
        player2.setEmail("player2@deadlands.com");
        player2.setPassword(passwordEncoder.encode("password123"));
        player2.setRole("PLAYER");
        player2.setActive(true);
        player2.setCreatedAt(LocalDateTime.now());
        player2.setUpdatedAt(LocalDateTime.now());
        userRepository.save(player2);
        logger.info("Created user: player2");

        logger.info("Database initialization completed successfully!");
    }
}
