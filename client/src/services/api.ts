import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;

export const sendMessage = async (
  message: string,
  sessionId?: string
) => {
  const response = await axios.post(
    `${API_URL}/chat/message`,
    {
      message,
      sessionId,
    }
  );

  return response.data;
};

export const getHistory = async (
  sessionId: string
) => {
  const response = await axios.get(
    `${API_URL}/chat/${sessionId}/messages`
  );

  return response.data;
};