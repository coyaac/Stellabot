"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { useChatSession } from "@/hooks/useChatSession"
import { Label } from "@/components/ui/label"

export function Chatbot({ startOpen = false, hideLauncher = false, embedded = false }: { startOpen?: boolean; hideLauncher?: boolean; embedded?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(startOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [leadOpen, setLeadOpen] = useState(false)
  const [leadMode, setLeadMode] = useState<'starter' | 'activate'>("starter")
  const [lead, setLead] = useState({ name: "", email: "", phone: "" })
  const [emailError, setEmailError] = useState("")
  const [showStarterCta, setShowStarterCta] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    currentOptions,
    guidedCount,
    aiAvailable,
    aiEnabled,
    starterRequested,
    loading,
    error,
    selectOption,
    sendAiMessage,
    activateAI,
    requestStarterPack,
  } = useChatSession()

  const handleOptionSelect = async (opt: { text: string; nextStepId: string }) => {
    // If the guided flow requests to enter email to unlock AI, open the lead modal instead of requesting a next step
    if (opt.nextStepId === 'AI_chat') {
      setLeadMode('starter');
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
      e.preventDefault()
      handleSendMessage()
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (value: string) => {
    setLead({ ...lead, email: value })
    if (value.trim() && !validateEmail(value)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }
  useEffect(() => { scrollToBottom() }, [messages])

  // When AI gets enabled, show a one-time CTA inside the chat to request the Starter Pack
  useEffect(() => {
    if (aiEnabled) setShowStarterCta(true)
  }, [aiEnabled])

  // Ensure we scroll to the inline CTA when it appears (after 5th interaction)
  useEffect(() => {
    if (showStarterCta) {
      // Slight delay to ensure DOM is painted before scrolling
      const t = setTimeout(() => scrollToBottom(), 20)
      return () => clearTimeout(t)
    }
  }, [showStarterCta])

  // Listen for reopen message from parent widget (when inside iframe)
  useEffect(() => {
    // Check if we're inside an iframe
    const isInIframe = window.self !== window.top
    if (isInIframe || embedded) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'stellabot-reopen') {
          setIsOpen(true)
          setIsClosing(false)
        }
      }
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }
  }, [embedded])

  // Clear email error when modal opens
  useEffect(() => {
    if (leadOpen) {
      setEmailError("")
    }
  }, [leadOpen])

  return (
    <>
  {/* Floating button to open chat */}
      {!isOpen && !hideLauncher && (
        <Button
          onClick={() => { setIsClosing(false); setIsOpen(true) }}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#ca2ca3] hover:opacity-90 shadow-lg transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

  {/* Chat window */}
    {isOpen && (
  <Card className={`${embedded ? 'relative w-full h-full max-w-sm max-h-[500px] shadow-none bg-white border border-[var(--color-border,#e3d9d3)]' : 'fixed bottom-6 right-6 w-80 h-[480px] shadow-none bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-[var(--color-border,#e3d9d3)]'} flex flex-col z-50 transform-gpu overflow-hidden rounded-lg p-0 ${isClosing ? "pointer-events-none animate-chat-panel-out" : "pointer-events-auto animate-chat-panel-in"} ${leadOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 bg-[#ca2ca3] text-white">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Stellabot</h3>
                <p className="text-xs text-white/80">{loading ? 'Loading…' : 'Ready'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {aiEnabled && !starterRequested && !showStarterCta && (
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => { setLeadMode('starter'); setLeadOpen(true); }}
                >
                  Get Starter Pack
                </Button>
              )}
              <Button
                onClick={() => {
                  setIsOpen(false)
                  setIsClosing(false)
                  // Notify parent widget that chat is closed (when inside iframe)
                  const isInIframe = window.self !== window.top
                  if ((isInIframe || embedded) && window.parent) {
                    window.parent.postMessage('stellabot-closed', '*')
                  }
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'} ${m.sender === 'user' ? 'animate-chat-bubble-right' : 'animate-chat-bubble-left'}`}
                >
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
                  {currentOptions.map((opt, idx) => (
                    <Button
                      key={opt.nextStepId}
                      onClick={() => handleOptionSelect(opt)}
                      variant="outline"
                      className="w-full max-w-full text-left justify-start items-start text-sm leading-snug h-auto p-3 border-[var(--color-primary-a,#ca2ca3)]/30 hover:bg-[var(--color-primary-a,#ca2ca3)]/10 overflow-hidden rounded-md animate-option-in"
                      style={{ animationDelay: `${Math.min(idx * 60, 300)}ms` }}
                    >
                      <span className="whitespace-normal break-words text-left block w-full">
                        {opt.text}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Inline CTA inside the chat stream for Starter Pack once AI is enabled */}
              {aiEnabled && showStarterCta && !starterRequested && (
                <div className="flex gap-3 justify-start animate-chat-bubble-left">
                  <div className="h-8 w-8 rounded-full bg-[#ca2ca3] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[280px] p-3 rounded-lg text-sm shadow-sm bg-[#bbd1d9] text-[var(--color-text-dark,#2b2330)]">
                    <div className="space-y-2">
                      <p>Want our Starter Pack in your inbox?</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-[#ca2ca3] text-white hover:opacity-90"
                          onClick={() => { setLeadMode('starter'); setLeadOpen(true); }}
                        >
                          Get Starter Pack
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowStarterCta(false)}>Not now</Button>
                      </div>
                    </div>
                  </div>
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
            <div className="p-4 border-t border-[var(--color-border,#e3d9d3)] bg-[#6a7445]">
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
                  className="flex-1 bg-white/10 text-white placeholder:text-white/80 border-white/60 focus-visible:ring-white/70 focus-visible:ring-offset-0 caret-white"
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

      {/* Lead capture modal - overlay on top of chat */}
      {leadOpen && isOpen && (
        <div 
          className={`${embedded ? 'absolute inset-0' : 'fixed bottom-6 right-6 w-80 h-[480px]'} z-[9999999] flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg`}
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) {
              setLeadOpen(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-[300px] shadow-2xl relative" 
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{leadMode === 'starter' ? 'Get Starter Pack' : 'Activate AI'}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {leadMode === 'starter'
                  ? 'Leave your details to receive the Starter Pack by email.'
                  : 'Leave your details to continue chatting with the AI.'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="lead-name">Name*</Label>
                <Input id="lead-name" value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="lead-email">Email*</Label>
                <Input 
                  id="lead-email" 
                  type="email" 
                  value={lead.email} 
                  onChange={e => handleEmailChange(e.target.value)} 
                  placeholder="you@example.com"
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="lead-phone">Phone</Label>
                <Input id="lead-phone" value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} placeholder="Optional" />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <Button variant="ghost" onClick={() => setLeadOpen(false)}>Cancel</Button>
              <Button
                disabled={!lead.name.trim() || !lead.email.trim() || !!emailError || loading}
                onClick={async () => {
                  if (leadMode === 'starter') {
                    await requestStarterPack({ name: lead.name.trim(), email: lead.email.trim(), phone: lead.phone.trim() || undefined });
                  } else {
                    await activateAI({ name: lead.name.trim(), email: lead.email.trim(), phone: lead.phone.trim() || undefined });
                  }
                  setLeadOpen(false);
                }}
                className="bg-[#ca2ca3] text-white hover:opacity-90"
              >
                {loading ? (leadMode === 'starter' ? 'Sending...' : 'Activating...') : (leadMode === 'starter' ? 'Get Pack' : 'Activate')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
