package com.gymtracker.controller;

import com.gymtracker.dto.NotificationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public String sendNotification(@RequestBody String message) {
        messagingTemplate.convertAndSend("/topic/notifications", new NotificationMessage(message));
        return "Notification sent: " + message;
    }
}
