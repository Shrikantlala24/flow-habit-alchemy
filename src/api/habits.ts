const API_URL = "http://localhost:5000/api/habits";

export const getHabits = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const addHabit = async (habit: { name: string; description?: string }) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  return response.json();
};

export const deleteHabit = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};