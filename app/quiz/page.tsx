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
import { getQuestions } from "@/lib/firestore/questions"
import { getPartiesForQuiz, type PartyForQuiz } from "@/lib/firestore/partyAnswers"
import { saveResponse } from "@/lib/firestore/responses"
import { calculateMatch } from "@/lib/quiz"
import type { Question } from "@/lib/types"

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
  const [firestoreQuestions, setFirestoreQuestions] = useState<Question[]>([])
  const [firestoreParties, setFirestoreParties] = useState<PartyForQuiz[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const quizQuestions = firestoreQuestions
  
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
  const handleFinishQuiz = useCallback(async () => {
    setIsLoading(true)
    try {
      const userAnswersList = Object.entries(answers).flatMap(([idxStr, ans]) => {
        const externalId = firestoreQuestions[parseInt(idxStr)]?.externalId
        // Skip answers whose question has no externalId to keep IDs consistent
        if (!externalId) return []
        return [{ questionExternalId: externalId, answer: ans.answer, important: ans.important }]
      })
      const results = firestoreParties
        .map((party) => ({
          partyId: party.docId,
          partyName: party.name,
          percentage: calculateMatch(userAnswersList, party.answers),
        }))
        .sort((a, b) => b.percentage - a.percentage)
      if (firestoreParties.length > 0) {
        await saveResponse({
          answers: answers as Record<number, { answer: "yes" | "no" | "neutral"; important: boolean }>,
          results,
        })
      }
    } catch (err) {
      console.error("[quiz] saveResponse failed:", err)
      setSaveError(true)
    }
    setTimeout(() => router.push("/result"), 2500)
  }, [router, answers, firestoreQuestions, firestoreParties])

  // Navigation handlers
  const goToNext = useCallback(() => {
    const hasAnswer = answers[currentQuestion]?.answer
    if (!hasAnswer) {
      setShowValidationError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    
    if (currentQuestion < quizQuestions.length - 1) {
      setDirection(1)
      setCurrentQuestion((prev) => prev + 1)
      setIsImportant(answers[currentQuestion + 1]?.important || false)
      setShowValidationError(false)
    } else {
      handleFinishQuiz()
    }
  }, [currentQuestion, answers, handleFinishQuiz, quizQuestions.length])

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

  // Load questions and party answers from Firestore
  const loadData = useCallback(() => {
    setDataLoading(true)
    setFetchError(false)
    Promise.all([getQuestions(), getPartiesForQuiz()])
      .then(([qs, parties]) => {
        setFirestoreQuestions(qs.filter((q) => q.active))
        setFirestoreParties(parties.filter((p) => p.docId))
      })
      .catch((err) => {
        console.error("[quiz] loadData failed:", err)
        setFetchError(true)
      })
      .finally(() => setDataLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    return (
      <>
        <LoadingScreen />
        {saveError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 bg-[#EF4444]/90 text-white px-5 py-3 rounded-xl text-sm shadow-xl backdrop-blur-sm whitespace-nowrap">
            Error al guardar resultados. Redirigiendo igualmente…
          </div>
        )}
      </>
    )
  }

  if (dataLoading) {
    return <LoadingScreen />
  }

  if (fetchError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 p-6">
        <p className="text-slate-500 text-lg text-center">
          Error al cargar el cuestionario. Verifica tu conexión.
        </p>
        <button
          onClick={loadData}
          className="px-6 py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors"
        >
          Reintentar
        </button>
      </main>
    )
  }

  if (quizQuestions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500 text-lg">No hay preguntas disponibles. Vuelve pronto.</p>
      </main>
    )
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
            <ProgressBar current={currentQuestion + 1} total={quizQuestions.length} />
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
                  question={quizQuestions[currentQuestion]?.text ?? ""}
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
                <span>{currentQuestion === quizQuestions.length - 1 ? "Ver resultados" : "Siguiente"}</span>
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
