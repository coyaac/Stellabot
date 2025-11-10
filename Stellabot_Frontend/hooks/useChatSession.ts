import { useCallback, useEffect, useState } from 'react';
import { guide, askAI, enableAI, requestStarterPack as apiRequestStarterPack, GuidedResponse } from '@/lib/chatApi';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'guided' | 'ai';
}

interface UseChatSessionOptions {
  autoStart?: boolean;
}

// Key for sessionStorage
const SESSION_KEY = 'stellabot_chat_session';

// Helper to load session from sessionStorage
const loadSessionFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Helper to save session to sessionStorage
const saveSessionToStorage = (session: any) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session:', e);
  }
};

export function useChatSession(opts: UseChatSessionOptions = {}) {
  const { autoStart = true } = opts;
  
  // Try to load from sessionStorage on mount
  const stored = loadSessionFromStorage();
  
  const [messages, setMessages] = useState<ChatMessage[]>(stored?.messages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<{ text: string; nextStepId: string }[]>(stored?.currentOptions || []);
  const [guidedCount, setGuidedCount] = useState(stored?.guidedCount || 0);
  const [aiAvailable, setAiAvailable] = useState(stored?.aiAvailable || false);
  const [aiEnabled, setAiEnabled] = useState(stored?.aiEnabled || false);
  const [starterRequested, setStarterRequested] = useState(stored?.starterRequested || false);

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    saveSessionToStorage({
      messages,
      currentOptions,
      guidedCount,
      aiAvailable,
      aiEnabled,
      starterRequested,
    });
  }, [messages, currentOptions, guidedCount, aiAvailable, aiEnabled, starterRequested]);

  const loadStep = useCallback(async (nextStepId?: string) => {
    setLoading(true); setError(null);
    try {
      const data: GuidedResponse = await guide(nextStepId);
      setGuidedCount(data.guidedCount);
      setAiAvailable(data.aiAvailable);
      setAiEnabled(!!data.aiEnabled);
  setStarterRequested(!!data.starterRequested);
  // Add the step text as a bot message (first message or when the step changes)
      setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, text: data.text, sender: 'bot', type: 'guided' }]);
      setCurrentOptions(data.options || []);
    } catch (e: any) {
      setError(e.message || 'Error loading step');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectOption = useCallback(async (opt: { text: string; nextStepId: string }) => {
    // User message
    setMessages(prev => [...prev, { id: `${Date.now()}-u`, text: opt.text, sender: 'user', type: 'guided' }]);
    // Special client-side options
    if (opt.nextStepId === '__continue_ai') {
      setMessages(prev => [...prev, { id: `${Date.now()}-n`, text: 'Okay! Continue chatting with AI.', sender: 'bot', type: 'guided' }]);
      setCurrentOptions([]);
      return;
    }
    if (opt.nextStepId === '__start_over') {
      setMessages(prev => [...prev, { id: `${Date.now()}-r`, text: 'Returning to the beginning…', sender: 'bot', type: 'guided' }]);
      await loadStep(); // GET start without incrementing count
      return;
    }
    await loadStep(opt.nextStepId);
  }, [loadStep]);

  const sendAiMessage = useCallback(async (text: string) => {
  if (!aiEnabled) { setError('AI is not enabled yet.'); return; }
    setMessages(prev => [...prev, { id: `${Date.now()}-uai`, text, sender: 'user', type: 'ai' }]);
    setLoading(true); setError(null);
    try {
      const data = await askAI(text);
      setMessages(prev => [...prev, { id: `${Date.now()}-ai`, text: data.reply, sender: 'bot', type: 'ai' }]);
    } catch (e: any) {
      setError(e.message || 'AI error');
    } finally { setLoading(false); }
  }, [aiEnabled]);

  const activateAI = useCallback(async (lead: { name: string; email: string; phone?: string }) => {
    setLoading(true); setError(null);
    try {
      await enableAI(lead);
      setAiAvailable(true);
      setAiEnabled(true);
    } catch (e: any) {
      setError(e.message || 'Error enabling AI');
    } finally { setLoading(false); }
  }, []);

  const requestStarterPack = useCallback(async (lead: { name: string; email: string; phone?: string }) => {
    setLoading(true); setError(null);
    try {
      const r = await apiRequestStarterPack(lead);
      // Optionally, append a bot message to confirm
      setMessages(prev => [
        ...prev,
        { id: `${Date.now()}-sp`, text: r.message || 'Starter Pack requested. Check your inbox.', sender: 'bot', type: 'guided' },
        { id: `${Date.now()}-q`, text: 'Would you like to go back to the beginning options?', sender: 'bot', type: 'guided' },
      ]);
      setStarterRequested(true);
      // Offer options to return to start or continue with AI
      setCurrentOptions([
        { text: 'Yes, show me the first options', nextStepId: '__start_over' },
        { text: 'No, keep chatting with AI', nextStepId: '__continue_ai' },
      ]);
    } catch (e: any) {
      setError(e.message || 'Error requesting Starter Pack');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    // Only auto-load the first step if there's no stored session
    if (autoStart && messages.length === 0) {
      loadStep();
    }
  }, [autoStart, loadStep, messages.length]);

  return {
    messages,
    loading,
    error,
    currentOptions,
    guidedCount,
    aiAvailable,
    aiEnabled,
    starterRequested,
    selectOption,
    sendAiMessage,
    activateAI,
    requestStarterPack,
    reload: () => loadStep(),
  };
}
