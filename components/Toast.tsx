"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return a no-op function if not wrapped in provider
    return { addToast: () => {} }
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#5B8FCB]" />
      case "error":
        return <XCircle className="w-5 h-5 text-[#EF4444]" />
      case "info":
        return <Info className="w-5 h-5 text-[#6B7280]" />
    }
  }

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-l-[#5B8FCB]"
      case "error":
        return "border-l-[#EF4444]"
      case "info":
        return "border-l-[#6B7280]"
    }
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto bg-white rounded-xl shadow-lg border border-[#6B7280]/10 border-l-4 ${getBorderColor(toast.type)} p-4 flex items-start gap-3`}
            >
              {getIcon(toast.type)}
              <p className="flex-1 text-sm text-[#111111] font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#6B7280] hover:text-[#111111] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
