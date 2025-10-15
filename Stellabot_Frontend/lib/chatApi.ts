import { v4 as uuid } from 'uuid';

// Base URL del backend (ajustar si se despliega en otro host)
// LÍNEA CORRECTA
// CORRECTO
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/chat`;


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
  starterRequested?: boolean;
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

// PEGA ESTA NUEVA VERSIÓN
export async function guide(nextStepId?: string): Promise<GuidedResponse> {
  const sessionId = getOrCreateSessionId();
  // Si no hay un nextStepId, es la primera llamada y debe ser GET
  if (!nextStepId) {
    const response = await fetch(`${BASE_URL}/guide`, {
      method: 'GET'
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error ${response.status} ${response.statusText}: ${text}`);
    }
    return response.json();
  }
  // Si hay un nextStepId, es un paso siguiente y sí debe ser POST
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

export async function requestStarterPack(lead: LeadData): Promise<{ message: string }> {
  const sessionId = getOrCreateSessionId();
  return postJson<{ message: string }>(`${BASE_URL}/starter-pack`, { sessionId, ...lead });
}

export async function resetSession(): Promise<{ ok: boolean }> {
  const sessionId = getOrCreateSessionId();
  return postJson<{ ok: boolean }>(`${BASE_URL}/reset`, { sessionId });
}
