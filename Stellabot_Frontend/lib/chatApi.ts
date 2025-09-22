import { v4 as uuid } from 'uuid';

// Base URL del backend (ajustar si se despliega en otro host)
// LÍNEA CORRECTA
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export interface GuidedOption {
  text: string;
  nextStepId: string;
}

export interface GuidedResponse {
  text: string;
  options?: GuidedOption[];
  guidedCount: number;
  aiAvailable: boolean;
  aiEnabled?: boolean;
}

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('stellabot_session');
  if (!sid) {
    sid = uuid();
    localStorage.setItem('stellabot_session', sid);
  }
  return sid;
}

async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function guide(nextStepId?: string): Promise<GuidedResponse> {
  const sessionId = getOrCreateSessionId();
  return postJson<GuidedResponse>(`${BASE_URL}/guide`, { sessionId, nextStepId });
}

export async function enableAI(lead: LeadData): Promise<{ message: string }> {
  const sessionId = getOrCreateSessionId();
  return postJson<{ message: string }>(`${BASE_URL}/enable-ai`, { sessionId, ...lead });
}

export async function askAI(message: string): Promise<{ reply: string }> {
  const sessionId = getOrCreateSessionId();
  return postJson<{ reply: string }>(`${BASE_URL}/ia`, { sessionId, message });
}
