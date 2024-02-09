//slackApi.ts
import { CONFIG } from './config.ts';

interface SlackApiResponse {
  ok: boolean; 
  error?: string; // Add optional error field
  // Add other potentially useful response fields here
}

// Generic function to call Slack API endpoints
async function callSlackApi<T>(endpoint: string, method: string = "GET", body: Record<string, unknown> = {}): Promise<T> {
  const url = `https://slack.com/api/${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${CONFIG.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  if (method !== "GET") options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json() as SlackApiResponse; // Assume API responses follow SlackApiResponse format

  if (!data.ok) throw new Error(`Slack API request failed: ${data.error || 'Unknown error'}`); 
  return data; 
}

// Fetches the email of a Slack user by their user ID
async function fetchUserEmailFromSlack(userId: string): Promise<string> {
  const data = await callSlackApi<any>(`users.info?user=${userId}`); 

  if (!data.user || !data.user.profile.email) throw new Error('Email not found for user.');
  return data.user.profile.email;
}

// Posts a message to a Slack channel or user
async function postMessageToSlack(channel: string, blocks: any[]): Promise<void> {
  await callSlackApi("chat.postMessage", "POST", {
    channel,
    blocks,
  });
}

export { fetchUserEmailFromSlack, postMessageToSlack };
