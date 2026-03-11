"use client"

import { Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ImportantToggleProps {
  isImportant: boolean
  onToggle: () => void
}

export function ImportantToggle({ isImportant, onToggle }: ImportantToggleProps) {
  const label = isImportant ? "Pregunta importante" : "Marcar como importante"

  return (
    <button
      onClick={onToggle}
      aria-label={label}
      aria-pressed={isImportant}
      className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-200 ${
        isImportant
          ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
          : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300 hover:bg-amber-50"
      }`}
    >
      {/* Icon + mobile label stacked vertically; desktop shows icon + inline label */}
      <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={isImportant ? "filled" : "empty"}
            initial={{ scale: 0.5, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 30 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <Star
              className={`w-5 h-5 ${isImportant ? "fill-white text-white" : "text-amber-400"}`}
            />
          </motion.span>
        </AnimatePresence>

        {/* Always visible label — small on mobile, normal on desktop */}
        <span className="text-[10px] leading-tight font-medium sm:text-sm sm:leading-normal">
          {label}
        </span>
      </span>
    </button>
  )
}
