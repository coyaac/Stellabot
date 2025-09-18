"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User, ArrowLeft } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatOption {
  id: string
  text: string
  response: string
  nextOptions?: ChatOption[]
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy el asistente de The Stella Way. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<ChatOption[]>([])
  const [optionHistory, setOptionHistory] = useState<ChatOption[][]>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const initialOptions: ChatOption[] = [
    {
      id: "courses",
      text: "¿Qué tipos de cursos puedo crear?",
      response:
        "En The Stella Way te ayudamos a crear diversos tipos de cursos: cursos técnicos, de desarrollo personal, empresariales, creativos y más. ¿Qué área te interesa más?",
      nextOptions: [
        {
          id: "technical",
          text: "Cursos técnicos y tecnología",
          response:
            "Excelente elección. Los cursos técnicos tienen alta demanda. Te ayudamos con programación, diseño web, marketing digital, análisis de datos y más.",
        },
        {
          id: "business",
          text: "Cursos de negocios y emprendimiento",
          response:
            "Perfecto. Los cursos de negocios son muy populares. Podemos ayudarte con liderazgo, finanzas, marketing, ventas y estrategia empresarial.",
        },
        {
          id: "creative",
          text: "Cursos creativos y artísticos",
          response:
            "¡Fantástico! Los cursos creativos conectan emocionalmente. Te apoyamos con fotografía, diseño gráfico, escritura, música y artes visuales.",
        },
      ],
    },
    {
      id: "process",
      text: "¿Cómo es el proceso de creación?",
      response:
        "Nuestro proceso tiene 4 etapas: 1) Consultoría inicial y definición de objetivos, 2) Diseño instruccional y estructura del curso, 3) Producción de contenido multimedia, 4) Lanzamiento y estrategia de marketing. ¿Qué etapa te interesa conocer más?",
      nextOptions: [
        {
          id: "consultation",
          text: "Consultoría inicial",
          response:
            "En la consultoría inicial analizamos tu expertise, definimos tu audiencia objetivo, establecemos objetivos de aprendizaje y creamos la estrategia del curso.",
        },
        {
          id: "design",
          text: "Diseño instruccional",
          response:
            "En el diseño instruccional estructuramos el contenido, creamos actividades interactivas, definimos evaluaciones y optimizamos la experiencia de aprendizaje.",
        },
        {
          id: "production",
          text: "Producción de contenido",
          response:
            "En producción creamos videos profesionales, materiales descargables, presentaciones interactivas y todos los recursos multimedia necesarios.",
        },
      ],
    },
    {
      id: "pricing",
      text: "¿Cuáles son los precios y paquetes?",
      response:
        "Ofrecemos diferentes paquetes adaptados a tus necesidades: Básico (diseño y estructura), Profesional (incluye producción multimedia), Premium (servicio completo con marketing). ¿Qué nivel de acompañamiento necesitas?",
      nextOptions: [
        {
          id: "basic",
          text: "Paquete Básico",
          response:
            "El paquete Básico incluye consultoría inicial, diseño instruccional, estructura del curso y plantillas. Ideal si ya tienes experiencia creando contenido.",
        },
        {
          id: "professional",
          text: "Paquete Profesional",
          response:
            "El paquete Profesional incluye todo lo básico más producción de videos, materiales gráficos y configuración de plataforma. Perfecto para un lanzamiento profesional.",
        },
        {
          id: "premium",
          text: "Paquete Premium",
          response:
            "El paquete Premium es servicio completo: desde la idea hasta el lanzamiento exitoso, incluyendo estrategia de marketing y acompañamiento post-lanzamiento.",
        },
      ],
    },
    {
      id: "contact",
      text: "¿Cómo puedo agendar una consulta?",
      response:
        "¡Perfecto! Puedes agendar una consulta gratuita de 30 minutos donde evaluaremos tu proyecto y te mostraremos cómo podemos ayudarte. ¿Prefieres llamada o videollamada?",
      nextOptions: [
        {
          id: "video",
          text: "Videollamada por Zoom",
          response:
            "Excelente elección. Las videollamadas nos permiten conocerte mejor y mostrar ejemplos visuales. Te enviaremos un enlace de calendario para que elijas el horario que mejor te convenga.",
        },
        {
          id: "phone",
          text: "Llamada telefónica",
          response:
            "Perfecto. Una llamada telefónica es ideal para una primera conversación. Te contactaremos para coordinar el mejor horario según tu disponibilidad.",
        },
      ],
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && currentOptions.length === 0) {
      setCurrentOptions(initialOptions)
    }
  }, [isOpen])

  const handleOptionSelect = async (option: ChatOption) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option.text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    setInteractionCount((prev) => prev + 1)

    // Simular respuesta del bot
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: option.response,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)

      // Actualizar opciones disponibles
      if (option.nextOptions && option.nextOptions.length > 0) {
        setOptionHistory((prev) => [...prev, currentOptions])
        setCurrentOptions(option.nextOptions)
      } else {
        // Si no hay más opciones, volver a las iniciales
        setOptionHistory((prev) => [...prev, currentOptions])
        setCurrentOptions(initialOptions)
      }

      // Después de 3 interacciones, mostrar opción de input personalizado
      if (interactionCount >= 2) {
        setShowCustomInput(true)
      }
    }, 1500)
  }

  const handleGoBack = () => {
    if (optionHistory.length > 0) {
      const previousOptions = optionHistory[optionHistory.length - 1]
      setCurrentOptions(previousOptions)
      setOptionHistory((prev) => prev.slice(0, -1))
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponses = [
        "Gracias por tu pregunta personalizada. Un especialista de The Stella Way se pondrá en contacto contigo pronto para darte una respuesta detallada.",
        "Excelente pregunta. Te recomiendo agendar una consulta gratuita donde podemos discutir tu caso específico en detalle.",
        "Esa es una consulta muy interesante. Nuestro equipo te contactará en las próximas 24 horas para brindarte información personalizada.",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Ventana del chatbot */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-2xl border-0 bg-white z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header del chat */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Asistente Stella</h3>
                <p className="text-xs text-white/80">En línea</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Área de mensajes */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[280px] p-3 rounded-lg text-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {!isTyping && currentOptions.length > 0 && (
                <div className="space-y-2">
                  {currentOptions.map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      variant="outline"
                      className="w-full text-left justify-start text-sm h-auto p-3 border-pink-200 hover:bg-pink-50 hover:border-pink-300 text-gray-700"
                    >
                      {option.text}
                    </Button>
                  ))}

                  {/* Botón para volver atrás */}
                  {optionHistory.length > 0 && (
                    <Button
                      onClick={handleGoBack}
                      variant="ghost"
                      className="w-full text-left justify-start text-sm h-auto p-3 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver atrás
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {showCustomInput && (
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="mb-2">
                <p className="text-xs text-gray-600">¿Tienes una pregunta específica?</p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta personalizada..."
                  className="flex-1 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  )
}
