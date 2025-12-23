package com.gymtracker.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gymtracker.service.FileStorageService;

/**
 * Cloudinary Upload Controller
 * Handles file upload to Cloudinary cloud storage
 * 
 * Endpoints:
 * - POST /api/cloudinary/upload - Upload image/video to Cloudinary
 * - DELETE /api/cloudinary/delete - Delete file from Cloudinary
 */
@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryController.class);

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Upload file to Cloudinary
     * Accepts images and videos
     * 
     * @param file - MultipartFile (image or video)
     * @return Cloudinary URL
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            String fileUrl = fileStorageService.storeFile(file);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("message", "File uploaded successfully");
            response.put("filename", file.getOriginalFilename());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to upload file: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", "Failed to upload file to Cloudinary");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Delete file from Cloudinary
     * 
     * @param fileUrl - Cloudinary file URL
     * @return Success message
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        try {
            fileStorageService.deleteFile(fileUrl);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully");
            response.put("deletedUrl", fileUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", "Failed to delete file from Cloudinary");
            return ResponseEntity.status(500).body(error);
        }
    }
}
