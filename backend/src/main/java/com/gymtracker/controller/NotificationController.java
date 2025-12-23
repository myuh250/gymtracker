package com.gymtracker.controller;

import com.gymtracker.dto.NotificationMessage;
import com.gymtracker.entity.Notification;
import com.gymtracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public String sendNotification(@RequestBody String message) {
        // Save to database
        Notification savedNotification = notificationService.createNotification(message);
        
        // Broadcast to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/notifications", new NotificationMessage(savedNotification.getContent()));
        
        return "Notification sent: " + message;
    }

    @GetMapping
    public List<Notification> getNotifications() {
        return notificationService.getAllNotifications();
    }
}
