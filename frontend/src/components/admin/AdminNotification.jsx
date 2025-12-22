import React, { useState } from 'react';
import { Card, Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { sendNotification } from '../../services/notificationService';

const { TextArea } = Input;

const AdminNotification = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!content.trim()) {
            message.warning('Please enter a notification message');
            return;
        }

        setLoading(true);
        try {
            await sendNotification(content);
            message.success('Notification sent successfully to all users');
            setContent('');
        } catch (error) {
            console.error('Failed to send notification:', error);
            message.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Broadcast Notification" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextArea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter notification message here..."
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={loading}
                    style={{ alignSelf: 'flex-end' }}
                >
                    Send Broadcast
                </Button>
            </div>
        </Card>
    );
};

export default AdminNotification;
