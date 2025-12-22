import apiClient from "../api/axios.customize";

const sendNotification = async (message) => {
    const response = await apiClient.post("/api/notifications/send", message, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
    return response.data;
};

export { sendNotification };
