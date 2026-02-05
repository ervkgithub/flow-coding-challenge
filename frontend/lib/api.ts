export type Reminder = {
  id: number;
  title: str;
  message: str;
  phone_number: str;
  scheduled_time: string;
  status: 'scheduled' | 'completed' | 'failed';
  created_at: string;
};

export type ReminderCreate = {
  title: str;
  message: str;
  phone_number: str;
  scheduled_time: string; // ISO string
};

const API_BASE = "http://localhost:8000";

export async function getReminders(): Promise<Reminder[]> {
  const res = await fetch(`${API_BASE}/reminders/`);
  if (!res.ok) throw new Error("Failed to fetch reminders");
  return res.json();
}

export async function createReminder(data: ReminderCreate): Promise<Reminder> {
  const res = await fetch(`${API_BASE}/reminders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create reminder");
  return res.json();
}

export async function deleteReminder(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/reminders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete reminder");
}
