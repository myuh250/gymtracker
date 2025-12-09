package com.gymtracker.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import io.github.cdimascio.dotenv.Dotenv;

/**
 * Configuration class to load environment variables from .env file
 * This class is executed before Spring Boot application starts
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            // Load .env file from root directory or classpath
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")  // Look in project root
                    .ignoreIfMissing()  // Don't fail if .env doesn't exist
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> dotenvMap = new HashMap<>();

            // Add all .env entries to Spring Environment
            dotenv.entries().forEach(entry -> {
                dotenvMap.put(entry.getKey(), entry.getValue());
                // Also set as system property for backward compatibility
                System.setProperty(entry.getKey(), entry.getValue());
            });

            // Add to Spring Environment with high priority
            environment.getPropertySources().addFirst(
                new MapPropertySource("dotenvProperties", dotenvMap)
            );

            System.out.println("✓ Loaded .env file successfully");

        } catch (Exception e) {
            System.out.println("⚠ Warning: .env file not found. Using system environment variables.");
        }
    }
}

