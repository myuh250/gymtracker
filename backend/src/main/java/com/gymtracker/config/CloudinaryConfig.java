package com.gymtracker.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary Configuration for Cloud Storage
 * 
 * Configure Cloudinary credentials in application.properties:
 * cloudinary.cloud-name=your_cloud_name
 * cloudinary.api-key=your_api_key
 * cloudinary.api-secret=your_api_secret
 * 
 * Or use environment variables for production:
 * cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
 * cloudinary.api-key=${CLOUDINARY_API_KEY}
 * cloudinary.api-secret=${CLOUDINARY_API_SECRET}
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true  // Always use HTTPS
        ));
    }
}
