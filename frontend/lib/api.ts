export type Reminder = {
  id: number;
  title: string;
  message: string;
  phone_number: string;
  scheduled_time: string;
  status: 'scheduled' | 'completed' | 'failed';
  created_at: string;
};

export type ReminderCreate = {
  title: string;
  message: string;
  phone_number: string;
  scheduled_time: string; // ISO string
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mock auth token to demonstrate authentication awareness
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'dummy-token-123' : '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

// Generic error handler to differentiate error types
async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorBody = await res.text().catch(() => null);
    if (res.status >= 500) {
      throw new Error(`Server Error (${res.status}): Please try again later.`);
    } else if (res.status === 401 || res.status === 403) {
      throw new Error(`Authentication Error: Not authorized.`);
    } else if (res.status >= 400) {
      throw new Error(`Client Error (${res.status}): ${errorBody || "Bad Request"}`);
    }
    throw new Error(`Network Error: Failed to fetch with status ${res.status}`);
  }
  return res.json();
}

export async function getReminders(page: number = 1, limit: number = 20): Promise<{ data: Reminder[], nextCursor?: number }> {
  // Using limit/offset for basic pagination as supported by backend
  const offset = (page - 1) * limit;
  const res = await fetch(`${API_BASE}/reminders/?offset=${offset}&limit=${limit}`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await handleResponse(res);
  // Simulating a paginated response wrapper since backend returns a straight array
  return {
    data,
    nextCursor: data.length === limit ? page + 1 : undefined
  };
}

export async function createReminder(data: ReminderCreate): Promise<Reminder> {
  const res = await fetch(`${API_BASE}/reminders/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteReminder(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/reminders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    await handleResponse(res); // to throw proper formatted error
  }
}
