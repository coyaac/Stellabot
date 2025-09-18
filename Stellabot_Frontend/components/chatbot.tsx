"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { useChatSession } from "@/hooks/useChatSession"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    currentOptions,
    guidedCount,
    aiAvailable,
    loading,
    error,
    selectOption,
    sendAiMessage,
  } = useChatSession()

  const handleOptionSelect = async (opt: { text: string; nextStepId: string }) => {
    await selectOption(opt)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    await sendAiMessage(inputValue.trim())
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); handleSendMessage()
    }
  }

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }
  useEffect(() => { scrollToBottom() }, [messages])

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-[var(--color-primary-a,#ca2ca3)] to-[var(--color-primary-b,#74456a)] hover:opacity-90 shadow-lg transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Ventana del chatbot */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[520px] flex flex-col shadow-2xl border border-[var(--color-border,#e3d9d3)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header del chat */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-primary-a,#ca2ca3)] to-[var(--color-primary-b,#74456a)] text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Stellabot</h3>
                <p className="text-xs text-white/80">{loading ? 'Cargando…' : 'Listo'}</p>
              </div>
            </div>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Área de mensajes */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-primary-a,#ca2ca3)] to-[var(--color-primary-b,#74456a)] flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[280px] p-3 rounded-lg text-sm shadow-sm ${m.sender === 'user' ? 'text-white bg-gradient-to-br from-[var(--color-primary-a,#ca2ca3)] to-[var(--color-primary-b,#74456a)]' : 'bg-[var(--color-bot-bg,#bbd1d9)] text-[var(--color-text-dark,#2b2330)]'}`}>
                    {m.text}
                  </div>
                  {m.sender === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-[var(--color-bot-bg,#bbd1d9)] flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-[var(--color-primary-b,#74456a)]" />
                    </div>
                  )}
                </div>
              ))}

              {error && <div className="text-xs text-red-600">{error}</div>}

              {!loading && currentOptions.length > 0 && (
                <div className="space-y-2">
                  {currentOptions.map(opt => (
                    <Button
                      key={opt.nextStepId}
                      onClick={() => handleOptionSelect(opt)}
                      variant="outline"
                      className="w-full text-left justify-start text-sm h-auto p-3 border-[var(--color-primary-a,#ca2ca3)]/30 hover:bg-[var(--color-primary-a,#ca2ca3)]/10"
                    >
                      {opt.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {aiAvailable && (
            <div className="p-4 border-t border-[var(--color-border,#e3d9d3)] bg-[var(--color-surface-alt,#d9c5bb)]/40">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-dark,#2b2330)]">Modo IA habilitado. Envía tu pregunta:</p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent,#a3ca2c)]/20 text-[var(--color-accent,#a3ca2c)] font-medium">IA Activa</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 border-[var(--color-primary-a,#ca2ca3)]/40 focus-visible:ring-[var(--color-primary-a,#ca2ca3)]/40"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                  className="bg-gradient-to-br from-[var(--color-primary-a,#ca2ca3)] to-[var(--color-primary-b,#74456a)] hover:opacity-90"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {!aiAvailable && (
            <div className="p-3 text-center text-[11px] text-[var(--color-text-dark,#2b2330)]/70 border-t border-[var(--color-border,#e3d9d3)] bg-white/60">
              <p>Interacciones guiadas: {guidedCount}. La IA se habilitará tras completar 5 pasos.</p>
            </div>
          )}
        </Card>
      )}
    </>
  )
}
