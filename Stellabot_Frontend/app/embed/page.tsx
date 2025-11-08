"use client"
import { Chatbot } from "@/components/chatbot"

export default function EmbedPage() {
  // Render only the chatbot overlay environment; page background minimal
  return (
    <div className="min-h-screen bg-transparent">
      <Chatbot startOpen hideLauncher />
      <style jsx global>{`
        body { background: transparent; }
      `}</style>
    </div>
  )
}
