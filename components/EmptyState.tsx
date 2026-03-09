"use client"

import { FileText, Building2, MessageSquare, Database, Plus } from "lucide-react"
import { motion } from "framer-motion"

interface EmptyStateProps {
  type: "questions" | "parties" | "answers" | "data"
  onAction?: () => void
}

const emptyStates = {
  questions: {
    icon: FileText,
    title: "No hay preguntas",
    description: "Aún no has agregado ninguna pregunta. Comienza creando tu primera pregunta.",
    actionText: "Agregar pregunta",
  },
  parties: {
    icon: Building2,
    title: "No hay partidos",
    description: "Aún no has agregado ningún partido político. Comienza agregando el primero.",
    actionText: "Agregar partido",
  },
  answers: {
    icon: MessageSquare,
    title: "No hay respuestas",
    description: "Aún no hay respuestas registradas. Agrega respuestas para los partidos.",
    actionText: "Agregar respuesta",
  },
  data: {
    icon: Database,
    title: "Sin datos",
    description: "No se encontraron datos para mostrar en esta sección.",
    actionText: "Recargar",
  },
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const state = emptyStates[type]
  const Icon = state.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 bg-[#5B8FCB]/10 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#5B8FCB]" />
      </div>
      <h3 className="text-lg font-semibold text-[#111111] mb-2">{state.title}</h3>
      <p className="text-[#6B7280] text-center max-w-sm mb-6">{state.description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors shadow-lg shadow-[#5B8FCB]/20"
        >
          <Plus className="w-5 h-5" />
          {state.actionText}
        </button>
      )}
    </motion.div>
  )
}
