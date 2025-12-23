package com.gymtracker.service;

import java.util.List;

import com.gymtracker.entity.Notification;

public interface NotificationService {
    Notification createNotification(String content);
    List<Notification> getAllNotifications();
}
