package com.gymtracker.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Store uploaded file and return URL
     * @param file Uploaded file
     * @return Public URL to access the file
     */
    String storeFile(MultipartFile file);
    
    /**
     * Delete file by URL
     * @param fileUrl File URL to delete
     */
    void deleteFile(String fileUrl);
}
