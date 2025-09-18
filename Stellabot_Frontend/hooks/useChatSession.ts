import { useCallback, useEffect, useState } from 'react';
import { guide, askAI, enableAI, GuidedResponse } from '@/lib/chatApi';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'guided' | 'ai';
}

interface UseChatSessionOptions {
  autoStart?: boolean;
}

export function useChatSession(opts: UseChatSessionOptions = {}) {
  const { autoStart = true } = opts;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<{ text: string; nextStepId: string }[]>([]);
  const [guidedCount, setGuidedCount] = useState(0);
  const [aiAvailable, setAiAvailable] = useState(false);

  const loadStep = useCallback(async (nextStepId?: string) => {
    setLoading(true); setError(null);
    try {
      const data: GuidedResponse = await guide(nextStepId);
      setGuidedCount(data.guidedCount);
      setAiAvailable(data.aiAvailable);
      // Añadimos el texto del paso como mensaje bot (si es primer mensaje o cambia el step)
      setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, text: data.text, sender: 'bot', type: 'guided' }]);
      setCurrentOptions(data.options || []);
    } catch (e: any) {
      setError(e.message || 'Error cargando paso');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectOption = useCallback(async (opt: { text: string; nextStepId: string }) => {
    // Mensaje usuario
    setMessages(prev => [...prev, { id: `${Date.now()}-u`, text: opt.text, sender: 'user', type: 'guided' }]);
    await loadStep(opt.nextStepId);
  }, [loadStep]);

  const sendAiMessage = useCallback(async (text: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-uai`, text, sender: 'user', type: 'ai' }]);
    setLoading(true); setError(null);
    try {
      const data = await askAI(text);
      setMessages(prev => [...prev, { id: `${Date.now()}-ai`, text: data.reply, sender: 'bot', type: 'ai' }]);
    } catch (e: any) {
      setError(e.message || 'Error IA');
    } finally { setLoading(false); }
  }, []);

  const activateAI = useCallback(async (lead: { name: string; email: string; phone?: string }) => {
    setLoading(true); setError(null);
    try {
      await enableAI(lead);
      setAiAvailable(true);
    } catch (e: any) {
      setError(e.message || 'Error activando IA');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (autoStart) loadStep(); }, [autoStart, loadStep]);

  return {
    messages,
    loading,
    error,
    currentOptions,
    guidedCount,
    aiAvailable,
    selectOption,
    sendAiMessage,
    activateAI,
    reload: () => loadStep(),
  };
}
