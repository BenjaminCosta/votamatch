"use client"

import { motion } from "framer-motion"

interface PartyResult {
  name: string
  percentage: number
}

interface ResultListProps {
  results: PartyResult[]
}

export function ResultList({ results }: ResultListProps) {
  const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="space-y-3">
      {sortedResults.map((result, index) => (
        <motion.div
          key={result.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                {index + 2}
              </span>
              <h3 className="font-medium text-slate-800">{result.name}</h3>
            </div>
            <span className="font-bold text-slate-600">{result.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#5B8FCB]/60 to-[#4A7DB8]/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${result.percentage}%` }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.08 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
