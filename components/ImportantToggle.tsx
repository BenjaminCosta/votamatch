"use client"

import { Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ImportantToggleProps {
  isImportant: boolean
  onToggle: () => void
}

export function ImportantToggle({ isImportant, onToggle }: ImportantToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
        isImportant
          ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
          : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300 hover:bg-amber-50"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isImportant ? "filled" : "empty"}
          initial={{ scale: 0.5, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.5, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          <Star
            className={`w-5 h-5 ${isImportant ? "fill-white text-white" : "text-amber-400"}`}
          />
        </motion.div>
      </AnimatePresence>
      <span className="text-sm font-medium hidden sm:inline">
        {isImportant ? "Pregunta importante" : "Marcar como importante"}
      </span>
    </button>
  )
}
