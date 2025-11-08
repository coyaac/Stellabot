"use client"
import { Chatbot } from "@/components/chatbot"

export default function EmbedPage() {
  // Render only the chatbot overlay environment; page background minimal
  return (
    <div className="w-full h-full bg-transparent overflow-hidden">
      <Chatbot startOpen hideLauncher />
      <style jsx global>{`
        html, body, #__next { 
          height: 100%; 
          margin: 0; 
          padding: 0; 
          overflow: hidden;
        }
        body { background: transparent; }
      `}</style>
    </div>
  )
}
