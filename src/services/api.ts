// api.ts
// Axios/Fetch functions to call backend APIs (/chat, /insights)
// TODO: Implement API service functions

export async function sendChatRequest(payload: any) {
  // Replace with your backend URL
  const response = await fetch('http://localhost:8000/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function fetchInsights(session_id: string) {
  const response = await fetch(`http://localhost:8000/insights/${session_id}`);
  return response.json();
}