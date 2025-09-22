"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { useChatSession } from "@/hooks/useChatSession"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [leadOpen, setLeadOpen] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '', phone: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    currentOptions,
    guidedCount,
    aiAvailable,
    aiEnabled,
    loading,
    error,
    selectOption,
    sendAiMessage,
    activateAI,
  } = useChatSession()

  const handleOptionSelect = async (opt: { text: string; nextStepId: string }) => {
    // If the guided flow requests to enter email to unlock AI, open the lead modal instead of requesting a next step
    if (opt.nextStepId === 'AI_chat') {
      setLeadOpen(true);
      return;
    }
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
  {/* Floating button to open chat */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#ca2ca3] hover:opacity-90 shadow-lg transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

  {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[520px] flex flex-col shadow-2xl border border-[var(--color-border,#e3d9d3)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 bg-[#ca2ca3] text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Stellabot</h3>
                <p className="text-xs text-white/80">{loading ? 'Loading…' : 'Ready'}</p>
              </div>
            </div>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-full bg-[#ca2ca3] flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[280px] p-3 rounded-lg text-sm shadow-sm ${m.sender === 'user' ? 'text-white bg-[#ca2ca3]' : 'bg-[#bbd1d9] text-[var(--color-text-dark,#2b2330)]'}`}>
                    {m.text}
                  </div>
                  {m.sender === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-[#bbd1d9] flex items-center justify-center flex-shrink-0">
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
                      className="w-full max-w-full text-left justify-start items-start text-sm leading-snug h-auto p-3 border-[var(--color-primary-a,#ca2ca3)]/30 hover:bg-[var(--color-primary-a,#ca2ca3)]/10 overflow-hidden rounded-md"
                    >
                      <span className="whitespace-normal break-words text-left block w-full">
                        {opt.text}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {!aiEnabled && aiAvailable && (
            <div className="p-3 text-center text-[11px] text-[var(--color-text-dark,#2b2330)]/80 border-t bg-white/70">
              <p className="mb-2">AI is available. Activate it by leaving your details.</p>
              <Button size="sm" className="bg-[#ca2ca3] text-white hover:opacity-90" onClick={() => setLeadOpen(true)}>Activate AI</Button>
            </div>
          )}

          {aiEnabled && (
            <div className="p-4 border-t border-[var(--color-border,#e3d9d3)] bg-[#a3ca2c]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-white">AI mode enabled. Ask your question:</p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 text-white font-medium">AI Enabled</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 border-[var(--color-primary-a,#ca2ca3)]/40 focus-visible:ring-[var(--color-primary-a,#ca2ca3)]/40"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                  className="bg-[#ca2ca3] text-white hover:opacity-90"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {!aiAvailable && (
            <div className="p-3 text-center text-[11px] text-[var(--color-text-dark,#2b2330)]/70 border-t border-[var(--color-border,#e3d9d3)] bg-white/60">
              <p>Guided interactions: {guidedCount}. AI unlocks after completing 5 steps.</p>
            </div>
          )}
        </Card>
      )}

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Activate AI</DialogTitle>
            <DialogDescription>Leave your details to continue chatting with the AI.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="lead-name">Name*</Label>
              <Input id="lead-name" value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lead-email">Email*</Label>
              <Input id="lead-email" type="email" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input id="lead-phone" value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} placeholder="Optional" />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLeadOpen(false)}>Cancel</Button>
            <Button
              disabled={!lead.name.trim() || !lead.email.trim() || loading}
              onClick={async () => {
                await activateAI({ name: lead.name.trim(), email: lead.email.trim(), phone: lead.phone.trim() || undefined });
                setLeadOpen(false);
              }}
              className="bg-[#ca2ca3] text-white hover:opacity-90"
            >
              {loading ? 'Activating...' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
