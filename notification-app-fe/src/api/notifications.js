import { getAuthToken } from "./auth";
import { Log } from "./logger";

export async function fetchNotifications(params = {}) {
  try {
    const token = await getAuthToken();
    const query = new URLSearchParams();
    
    if (params.limit) {
      query.append("limit", params.limit);
    } else {
      query.append("limit", "10"); // Default limit is 10
    }
    
    if (params.page) {
      query.append("page", params.page);
    }
    
    if (params.notification_type && params.notification_type !== "All") {
      query.append("notification_type", params.notification_type);
    }

    const url = `/evaluation-service/notifications?${query.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      let parsedError = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.errors) {
          parsedError = parsed.errors.map(e => Object.entries(e).map(([k, v]) => `${k}: ${v}`).join(', ')).join('; ');
        } else if (parsed.message) {
          parsedError = parsed.message;
        }
      } catch (e) {}
      
      const errorMsg = `API Error: ${response.status} - ${parsedError}`;
      await Log("fetchNotifications", "error", "notification-app-fe", errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    await Log("fetchNotifications", "info", "notification-app-fe", `Successfully fetched page ${params.page || 1} with limit ${params.limit || 10}`);
    return data;
  } catch (error) {
    console.error("fetchNotifications error:", error);
    await Log("fetchNotifications", "error", "notification-app-fe", error.message);
    throw error;
  }
}
