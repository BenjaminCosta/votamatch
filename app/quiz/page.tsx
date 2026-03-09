"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ProgressBar } from "@/components/ProgressBar"
import { QuestionCard } from "@/components/QuestionCard"
import { ImportantToggle } from "@/components/ImportantToggle"
import { ConfirmModal } from "@/components/ConfirmModal"
import { LoadingScreen } from "@/components/LoadingScreen"
import { ChevronLeft, ChevronRight, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const mockQuestions = [
  "¿Deberían aumentarse los impuestos a las grandes empresas?",
  "¿Está de acuerdo con legalizar el uso recreativo de la marihuana?",
  "¿Debería el Estado invertir más en educación pública?",
  "¿Apoya la construcción de más cárceles para reducir la delincuencia?",
  "¿Cree que debería permitirse el matrimonio entre personas del mismo sexo?",
  "¿Está a favor de reducir las regulaciones ambientales para promover el crecimiento económico?",
  "¿Apoya el aumento del salario mínimo?",
  "¿Debería existir un sistema de salud universal gratuito?",
  "¿Está de acuerdo con fortalecer las políticas de inmigración?",
  "¿Cree que el gobierno debería subsidiar la energía renovable?",
  "¿Apoya la privatización de empresas estatales?",
  "¿Está de acuerdo con implementar más programas sociales?",
  "¿Debería reducirse el gasto militar?",
  "¿Apoya la descentralización del poder político?",
  "¿Cree que debería existir una renta básica universal?",
  "¿Está a favor de endurecer las penas por corrupción?",
  "¿Apoya la inversión en infraestructura de transporte público?",
  "¿Debería el Estado regular los precios de productos básicos?",
  "¿Está de acuerdo con promover la minería responsable?",
  "¿Cree que debería existir educación sexual en las escuelas?",
  "¿Apoya la protección de territorios indígenas?",
  "¿Está a favor de reducir la burocracia estatal?",
  "¿Debería permitirse la eutanasia?",
  "¿Apoya el acceso libre al aborto?",
  "¿Cree que debería fortalecerse la policía?",
  "¿Está de acuerdo con implementar peajes urbanos?",
  "¿Apoya la educación bilingüe en zonas rurales?",
  "¿Debería el Estado controlar los medios de comunicación?",
  "¿Está a favor de reducir la edad de jubilación?",
  "¿Apoya tratados de libre comercio?",
  "¿Cree que debería existir servicio militar obligatorio?",
  "¿Está de acuerdo con aumentar el presupuesto para ciencia y tecnología?",
  "¿Apoya la reforma del sistema judicial?",
]

interface Answer {
  answer: "yes" | "no" | "neutral"
  important: boolean
}

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [isImportant, setIsImportant] = useState(false)
  const [direction, setDirection] = useState(0)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [keyPressed, setKeyPressed] = useState<"yes" | "no" | "neutral" | null>(null)
  const [showValidationError, setShowValidationError] = useState(false)
  const [shake, setShake] = useState(false)
  
  // Touch gesture refs
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Derived state - defined before any hooks that use it
  const currentAnswer = answers[currentQuestion]?.answer

  // Handle answer
  const handleAnswer = useCallback((answer: "yes" | "no" | "neutral") => {
    setShowValidationError(false)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: { answer, important: isImportant },
    }))
  }, [currentQuestion, isImportant])

  // Finish quiz handler
  const handleFinishQuiz = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/result")
    }, 2500)
  }, [router])

  // Navigation handlers
  const goToNext = useCallback(() => {
    const hasAnswer = answers[currentQuestion]?.answer
    if (!hasAnswer) {
      setShowValidationError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    
    if (currentQuestion < mockQuestions.length - 1) {
      setDirection(1)
      setCurrentQuestion((prev) => prev + 1)
      setIsImportant(answers[currentQuestion + 1]?.important || false)
      setShowValidationError(false)
    } else {
      handleFinishQuiz()
    }
  }, [currentQuestion, answers, handleFinishQuiz])

  const goToPrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setDirection(-1)
      setCurrentQuestion((prev) => prev - 1)
      setIsImportant(answers[currentQuestion - 1]?.important || false)
      setShowValidationError(false)
    }
  }, [currentQuestion, answers])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next question
        goToNext()
      } else {
        // Swipe right - previous question
        goToPrevious()
      }
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key.toLowerCase()

      if (key === "s") {
        setKeyPressed("yes")
        handleAnswer("yes")
        setTimeout(() => setKeyPressed(null), 150)
      } else if (key === "n") {
        setKeyPressed("no")
        handleAnswer("no")
        setTimeout(() => setKeyPressed(null), 150)
      } else if (key === "x") {
        setKeyPressed("neutral")
        handleAnswer("neutral")
        setTimeout(() => setKeyPressed(null), 150)
      } else if (key === "enter") {
        goToNext()
      } else if (key === "arrowleft") {
        goToPrevious()
      } else if (key === "arrowright") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleAnswer, goToNext, goToPrevious])

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0 && !isLoading) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [answers, isLoading])

  // Handle popstate (back button)
  useEffect(() => {
    const handlePopState = () => {
      if (Object.keys(answers).length > 0 && !isLoading) {
        window.history.pushState(null, "", window.location.pathname)
        setShowExitModal(true)
        setPendingNavigation("/")
      }
    }

    window.history.pushState(null, "", window.location.pathname)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [answers, isLoading])

  const handleExitAttempt = (destination: string) => {
    if (Object.keys(answers).length > 0) {
      setShowExitModal(true)
      setPendingNavigation(destination)
    } else {
      router.push(destination)
    }
  }

  const handleConfirmExit = () => {
    setShowExitModal(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
  }

  // Background color variation based on question index
  const getBgColor = () => {
    const section = Math.floor(currentQuestion / 5)
    return section % 2 === 0 ? "bg-white" : "bg-[#F5F7FA]"
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <main 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`min-h-screen py-4 sm:py-6 px-4 relative overflow-hidden transition-colors duration-500 ${getBgColor()}`}
      >
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5B8FCB]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EF4444]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto relative">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 sm:mb-8"
          >
            <button 
              onClick={() => handleExitAttempt("/")}
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#111111] transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Inicio</span>
            </button>
            <Image
              src="/logo_votamatch.png"
              alt="Votamatch Perú 2026"
              width={120}
              height={60}
            />
            <div className="w-16" />
          </motion.div>

          {/* Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-8"
          >
            <ProgressBar current={currentQuestion + 1} total={mockQuestions.length} />
          </motion.div>

          {/* Question card with animation */}
          <div className="relative min-h-100 sm:min-h-80 mb-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestion}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`absolute inset-0 ${shake ? "animate-shake" : ""}`}
              >
                <QuestionCard
                  question={mockQuestions[currentQuestion]}
                  onAnswer={handleAnswer}
                  selectedAnswer={currentAnswer}
                  keyPressed={keyPressed}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Validation error message */}
          <AnimatePresence>
            {showValidationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-[#EF4444] text-sm mb-4"
              >
                <span>Debes seleccionar una respuesta para continuar.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between gap-2 sm:gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-[#6B7280]/10 shadow-sm"
          >
            <ImportantToggle
              isImportant={isImportant}
              onToggle={() => setIsImportant(!isImportant)}
            />

            <div className="flex gap-3">
              <button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#6B7280] border border-[#6B7280]/20 hover:bg-[#F5F7FA] hover:border-[#6B7280]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              <button
                onClick={goToNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] hover:shadow-lg hover:shadow-[#5B8FCB]/25 transition-all duration-200"
              >
                <span>{currentQuestion === mockQuestions.length - 1 ? "Ver resultados" : "Siguiente"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Keyboard hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block text-center text-xs text-[#6B7280] mt-4 space-y-1"
          >
            <p>Teclado: <span className="font-medium">S</span> (Si), <span className="font-medium">N</span> (No), <span className="font-medium">X</span> (Neutral)</p>
            <p className="text-[#6B7280]/70">Desliza o usa flechas para navegar</p>
          </motion.div>
        </div>
      </main>

      {/* Exit confirmation modal */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />

      {/* Shake animation style */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  )
}
