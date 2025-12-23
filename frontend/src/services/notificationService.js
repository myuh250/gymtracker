import apiClient from "../api/axios.customize";

const sendNotification = async (message) => {
    const response = await apiClient.post("/api/notifications/send", message, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
    return response.data;
};

const getNotifications = async () => {
    const response = await apiClient.get("/api/notifications");
    return response.data;
};

export { sendNotification, getNotifications };
