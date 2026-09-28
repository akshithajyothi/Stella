// src/lib/api/aiStylist.ts
// API client for AI Stylist chatbot backend

const AI_STYLIST_API = "http://127.0.0.1:8000";

export interface ChatMessage {
  user_id: number;
  message: string;
}

export interface ChatResponse {
  status: string;
  reply: string;
  model: string;
}

export interface ChatHistoryItem {
  id: number;
  user_id: number;
  user_message: string;
  ai_reply: string;
  timestamp: string;
}

// Send message to AI Stylist
export async function sendChatMessage(userId: number, message: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${AI_STYLIST_API}/ai-stylist/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // If backend is not running, return helpful error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("AI Stylist backend is not running. Please start the Python server.");
    }
    throw error;
  }
}

// Get chat history for user
export async function getChatHistory(userId: number): Promise<ChatHistoryItem[]> {
  try {
    const response = await fetch(`${AI_STYLIST_API}/ai-stylist/history/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }
}

// Delete chat history for user
export async function deleteChatHistory(userId: number): Promise<void> {
  const response = await fetch(`${AI_STYLIST_API}/ai-stylist/history/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

// Check if AI Stylist backend is available
export async function checkBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_STYLIST_API}/`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
