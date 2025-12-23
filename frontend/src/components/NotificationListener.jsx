import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notification, Drawer, List, Badge, Button, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { getNotifications } from '../services/notificationService';

const NotificationListener = () => {
    const [api, contextHolder] = notification.useNotification();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

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
                        
                        // Add to list
                        const newNotification = {
                            id: Date.now(), // Temp ID until refresh
                            content: notificationBody.content,
                            createdAt: new Date().toISOString()
                        };
                        
                        setNotifications(prev => [newNotification, ...prev]);
                        setUnreadCount(prev => prev + 1);

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

    const showDrawer = () => {
        setOpen(true);
        setUnreadCount(0); // Reset unread on open
    };

    const onClose = () => {
        setOpen(false);
    };

    return (
        <>
            {contextHolder}
            <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
                <Badge count={unreadCount}>
                    <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<BellOutlined />} 
                        size="large" 
                        onClick={showDrawer}
                    />
                </Badge>
            </div>
            <Drawer title="Notifications" placement="right" onClose={onClose} open={open}>
                <List
                    itemLayout="horizontal"
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={<Typography.Text>{item.content}</Typography.Text>}
                                description={new Date(item.createdAt).toLocaleString()}
                            />
                        </List.Item>
                    )}
                />
            </Drawer>
        </>
    );
};

export default NotificationListener;
