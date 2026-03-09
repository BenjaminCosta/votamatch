"use client"

import { Check, X, Minus } from "lucide-react"

interface QuestionCardProps {
  question: string
  onAnswer: (answer: "yes" | "no" | "neutral") => void
  selectedAnswer?: "yes" | "no" | "neutral"
  keyPressed?: "yes" | "no" | "neutral" | null
}

export function QuestionCard({ question, onAnswer, selectedAnswer, keyPressed }: QuestionCardProps) {
  const buttons = [
    { 
      value: "yes" as const, 
      label: "Sí", 
      icon: Check,
      selectedClass: "bg-[#5B8FCB] text-white border-[#5B8FCB] shadow-lg shadow-[#5B8FCB]/25",
      hoverClass: "hover:border-[#5B8FCB] hover:bg-[#5B8FCB]/10"
    },
    { 
      value: "neutral" as const, 
      label: "Neutral", 
      icon: Minus,
      selectedClass: "bg-[#6B7280] text-white border-[#6B7280] shadow-lg shadow-[#6B7280]/25",
      hoverClass: "hover:border-[#6B7280] hover:bg-[#6B7280]/10"
    },
    { 
      value: "no" as const, 
      label: "No", 
      icon: X,
      selectedClass: "bg-[#EF4444] text-white border-[#EF4444] shadow-lg shadow-[#EF4444]/25",
      hoverClass: "hover:border-[#EF4444] hover:bg-[#EF4444]/10"
    },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 h-full">
      <div className="flex items-center justify-center min-h-22.5 sm:min-h-30 mb-4 sm:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 text-center leading-relaxed text-balance">
          {question}
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        {buttons.map((btn) => {
          const isSelected = selectedAnswer === btn.value
          const isKeyPressed = keyPressed === btn.value
          const Icon = btn.icon
          
          return (
            <button
              key={btn.value}
              onClick={() => onAnswer(btn.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-medium text-base transition-all duration-200 border-2 ${
                isSelected
                  ? btn.selectedClass
                  : `bg-white text-[#111111] border-[#6B7280]/20 ${btn.hoverClass}`
              } ${isKeyPressed ? "scale-95 ring-2 ring-offset-2 ring-[#5B8FCB]" : ""}`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#6B7280]"}`} />
              {btn.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
