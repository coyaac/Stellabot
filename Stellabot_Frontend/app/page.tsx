import { Chatbot } from "@/components/chatbot"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Contenido principal de la página */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">The Stella Way</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Soluciones innovadoras para la creación y el lanzamiento de cursos en línea. Apoyamos a expertos en diversas
            áreas del conocimiento con herramientas y acompañamiento para diseñar experiencias de aprendizaje
            interactivas y escalables.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Diseño de Cursos</h3>
            <p className="text-slate-600">Creamos experiencias de aprendizaje atractivas y efectivas.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Lanzamiento</h3>
            <p className="text-slate-600">Te acompañamos en cada paso del proceso de lanzamiento.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Escalabilidad</h3>
            <p className="text-slate-600">Soluciones que crecen junto con tu negocio educativo.</p>
          </div>
        </div>
      </div>

      {/* Chatbot overlay */}
      <Chatbot />
    </div>
  )
}
