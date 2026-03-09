"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-slate-600">
          Pregunta <span className="text-[#5B8FCB] font-bold">{current}</span> de {total}
        </span>
        <span className="text-sm font-bold text-[#5B8FCB]">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#5B8FCB] to-[#4A7DB8] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
