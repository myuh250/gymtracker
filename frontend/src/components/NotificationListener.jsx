import React, { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notification } from 'antd';

const NotificationListener = () => {
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        console.log('Initializing WebSocket connection...');
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                stompClient.subscribe('/topic/notifications', (message) => {
                    console.log('Received message:', message.body);
                    try {
                        const notificationBody = JSON.parse(message.body);
                        api.info({
                            message: 'New Notification',
                            description: notificationBody.content,
                            placement: 'topRight',
                        });
                    } catch (error) {
                        console.error("Error parsing notification message:", error);
                    }
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketError: (error) => {
                console.error('Error with websocket', error);
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [api]);

    return <>{contextHolder}</>;
};

export default NotificationListener;
