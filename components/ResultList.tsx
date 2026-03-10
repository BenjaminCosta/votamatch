"use client"

import { motion } from "framer-motion"
import { PartyIcon } from "@/components/PartyIcon"
import { getPartyColor, colorToAlpha } from "@/lib/party-colors"

interface PartyResult {
  partyId: string
  name: string
  percentage: number
  partySlug: string
  partyIconFileName: string | null
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
          key={result.partyId || result.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
          style={{ borderLeftColor: getPartyColor(result.partySlug), borderLeftWidth: 3 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <PartyIcon
                  slug={result.partySlug ?? ""}
                  iconFileName={result.partyIconFileName ?? undefined}
                  name={result.name}
                  size={40}
                />
                <h3 className="font-medium text-slate-800 truncate">{result.name}</h3>
              </div>
              <span
                className="font-bold shrink-0 ml-3"
                style={{ color: getPartyColor(result.partySlug) }}
              >
                {result.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getPartyColor(result.partySlug) }}
                initial={{ width: 0 }}
                animate={{ width: `${result.percentage}%` }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.08 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
