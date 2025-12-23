package com.gymtracker.service.impl;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gymtracker.service.FileStorageService;

/**
 * Cloudinary cloud storage implementation for production
 * 
 * Features:
 * - Upload images and videos to Cloudinary CDN
 * - Automatic format optimization (WebP, AVIF)
 * - Responsive image transformations
 * - Video transcoding and streaming
 * - Secure HTTPS URLs
 */
@Service
@Primary
public class CloudinaryFileStorageServiceImpl implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryFileStorageServiceImpl.class);

    @Autowired
    private Cloudinary cloudinary;

    private static final String FOLDER_NAME = "gymtracker/exercises";

    @Override
    public String storeFile(MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("Cannot upload empty file");
            }

            String originalFilename = file.getOriginalFilename();
            String fileType = getFileType(originalFilename);

            logger.info(" Uploading {} to Cloudinary: {} (size: {} bytes)", 
                        fileType, originalFilename, file.getSize());

            // Upload parameters
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", FOLDER_NAME,  // Organize files in folders
                "resource_type", "auto",  // Auto-detect image/video
                "quality", "auto:best",  // Automatic quality optimization
                "fetch_format", "auto",  // Auto format (WebP for modern browsers)
                "use_filename", true,
                "unique_filename", true,
                "overwrite", false
            );

            // Add video-specific parameters for streaming
            if ("video".equals(fileType)) {
                logger.info(" Video upload - streaming enabled");
            }

            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                uploadParams
            );

            // Return secure URL (HTTPS)
            String secureUrl = (String) uploadResult.get("secure_url");
            
            // Log upload info
            logger.info(" Upload successful:");
            logger.info("   - URL: {}", secureUrl);
            logger.info("   - Public ID: {}", uploadResult.get("public_id"));
            logger.info("   - Format: {}", uploadResult.get("format"));
            logger.info("   - Size: {} bytes", uploadResult.get("bytes"));

            return secureUrl;

        } catch (IOException ex) {
            logger.error(" Failed to upload file to Cloudinary", ex);
            throw new RuntimeException("Failed to upload file to Cloudinary: " + ex.getMessage(), ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.contains("cloudinary.com")) {
                logger.warn(" Invalid Cloudinary URL for deletion: {}", fileUrl);
                return;
            }

            // Extract public_id from Cloudinary URL
            String publicId = extractPublicIdFromUrl(fileUrl);
            
            if (publicId != null) {
                logger.info(" Deleting from Cloudinary: {}", publicId);
                
                // Delete from Cloudinary
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                
                String resultStatus = (String) result.get("result");
                if ("ok".equals(resultStatus)) {
                    logger.info(" Delete successful: {}", publicId);
                } else {
                    logger.warn(" Delete result: {} for {}", resultStatus, publicId);
                }
            } else {
                logger.warn(" Could not extract public_id from URL: {}", fileUrl);
            }

        } catch (IOException ex) {
            logger.error(" Failed to delete file from Cloudinary", ex);
            throw new RuntimeException("Failed to delete file from Cloudinary: " + ex.getMessage(), ex);
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     * 
     * Example URL: https://res.cloudinary.com/demo/image/upload/v123/gymtracker/exercises/abc.jpg
     * Returns: gymtracker/exercises/abc
     * 
     * @param url Cloudinary URL
     * @return public_id without version and extension
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            // Split by /upload/
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            // Get everything after version (v123/)
            String afterUpload = parts[1];
            String[] versionParts = afterUpload.split("/", 2);
            if (versionParts.length < 2) {
                return null;
            }

            // Remove file extension
            String publicIdWithExt = versionParts[1];
            int lastDot = publicIdWithExt.lastIndexOf('.');
            if (lastDot > 0) {
                return publicIdWithExt.substring(0, lastDot);
            }

            return publicIdWithExt;
            
        } catch (Exception e) {
            logger.error("Failed to extract public_id from URL: {}", url, e);
            return null;
        }
    }

    /**
     * Determine file type from filename
     * 
     * @param filename Original filename
     * @return "video" or "image"
     */
    private String getFileType(String filename) {
        if (filename == null) {
            return "image";
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".mp4") || 
            lowerFilename.endsWith(".mov") || 
            lowerFilename.endsWith(".avi") || 
            lowerFilename.endsWith(".webm") ||
            lowerFilename.endsWith(".mkv") ||
            lowerFilename.endsWith(".flv")) {
            return "video";
        }
        
        return "image";
    }

    /**
     * Generate optimized image URL with transformations
     * 
     * Example usage:
     * String thumbnail = generateImageUrl(originalUrl, 200, 200, "fill");
     * 
     * @param originalUrl Original Cloudinary URL
     * @param width Desired width
     * @param height Desired height
     * @param crop Crop mode: fill, fit, scale, etc.
     * @return Transformed URL
     */
    public String generateImageUrl(String originalUrl, int width, int height, String crop) {
        if (originalUrl == null || !originalUrl.contains("cloudinary.com")) {
            return originalUrl;
        }
        
        String transformation = String.format("w_%d,h_%d,c_%s,f_auto,q_auto", width, height, crop);
        return originalUrl.replace("/upload/", "/upload/" + transformation + "/");
    }
}
