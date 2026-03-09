"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Salir del cuestionario?",
  message = "Si sales ahora, perderás tus respuestas.",
  confirmText = "Salir",
  cancelText = "Continuar respondiendo",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#111111]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-[#EF4444]/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-[#EF4444]" />
              </div>
              <h2 className="text-xl font-bold text-[#111111] mb-2">{title}</h2>
              <p className="text-[#6B7280] mb-6">{message}</p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border border-[#6B7280]/20 text-[#111111] font-medium hover:bg-[#F5F7FA] transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="w-full py-3 rounded-xl bg-[#EF4444] text-white font-medium hover:bg-[#DC2626] transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
