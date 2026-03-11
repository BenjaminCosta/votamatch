"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PartyIcon } from "@/components/PartyIcon"
import type { DetailedQuizData } from "@/lib/sessionResults"
import type { MatchResult } from "@/lib/types"

// ─── Types & helpers ──────────────────────────────────────────────────────

type AnswerValue = "yes" | "no" | "neutral"

const LABELS: Record<AnswerValue, string> = { yes: "Sí", no: "No", neutral: "Neutral" }

const ANSWER_BADGE: Record<AnswerValue, string> = {
  yes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  no: "bg-red-50 text-red-600 border-red-200",
  neutral: "bg-slate-100 text-slate-500 border-slate-200",
}

function matchScore(user: AnswerValue, party: AnswerValue) {
  if (user === party) return "full"
  if (user === "neutral" || party === "neutral") return "partial"
  return "none"
}

const MATCH_ROW_BG: Record<"full" | "partial" | "none", string> = {
  full: "bg-emerald-50/60",
  partial: "bg-amber-50/60",
  none: "bg-red-50/30",
}

const MATCH_ICON: Record<"full" | "partial" | "none", { symbol: string; cls: string }> = {
  full: { symbol: "✓", cls: "text-emerald-600 font-bold" },
  partial: { symbol: "~", cls: "text-amber-600 font-bold" },
  none: { symbol: "✗", cls: "text-red-500 font-bold" },
}

// ─── Component ────────────────────────────────────────────────────────────

interface Props {
  data: DetailedQuizData
  results: MatchResult[]
}

export function DetailedComparison({ data, results }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Sort parties by result ranking (best match first)
  const rankedParties = [...data.parties].sort((a, b) => {
    const ra = results.findIndex((r) => r.partyId === a.partyId)
    const rb = results.findIndex((r) => r.partyId === b.partyId)
    return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb)
  })

  // Build a lookup for user answers
  const userAnswerMap = new Map(data.userAnswers.map((ua) => [ua.questionExternalId, ua]))

  // Questions that were actually answered, sorted by display order
  const sortedQuestions = [...data.questions]
    .filter((q) => userAnswerMap.has(q.externalId))
    .sort((a, b) => a.order - b.order)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-white border border-slate-200 hover:border-[#5B8FCB]/40 hover:bg-slate-50/50 transition-all duration-200 shadow-sm"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B8FCB]/10 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-[#5B8FCB]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-sm">Ver comparación detallada</p>
            <p className="text-xs text-slate-400">
              {sortedQuestions.length} preguntas · {rankedParties.length} partidos
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="detail-content"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-3 space-y-3"
          >
            {/* Legend */}
            <div className="flex items-center gap-4 px-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                Leyenda:
              </span>
              {(
                [
                  ["full", "✓ Coincide"],
                  ["partial", "~ Parcial"],
                  ["none", "✗ Difiere"],
                ] as const
              ).map(([key, label]) => (
                <span key={key} className={`text-xs font-semibold ${MATCH_ICON[key].cls}`}>
                  {label}
                </span>
              ))}
            </div>

            {/* Question cards */}
            {sortedQuestions.map((q, idx) => {
              const ua = userAnswerMap.get(q.externalId)
              if (!ua) return null
              const userAns = ua.answer as AnswerValue

              return (
                <div
                  key={q.externalId}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Question header */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-300 shrink-0 mt-0.5 w-6 text-right">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{q.text}</p>
                      {q.category && (
                        <span className="inline-block mt-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {q.category}
                        </span>
                      )}
                    </div>
                    {ua.important && (
                      <span className="shrink-0 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                        ★ Importante
                      </span>
                    )}
                  </div>

                  {/* User answer */}
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Tu respuesta
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ANSWER_BADGE[userAns]}`}
                    >
                      {LABELS[userAns]}
                    </span>
                  </div>

                  {/* Party answers */}
                  <div className="divide-y divide-slate-50/80">
                    {rankedParties.map((party, pIdx) => {
                      const partyAns = ((party.answers[q.externalId] as AnswerValue | undefined) ??
                        "neutral") as AnswerValue
                      const match = matchScore(userAns, partyAns)
                      const icon = MATCH_ICON[match]

                      return (
                        <div
                          key={party.partyId}
                          className={`px-4 py-2 flex items-center gap-2.5 ${MATCH_ROW_BG[match]}`}
                        >
                          <span className="text-[11px] text-slate-300 font-mono w-5 shrink-0 text-right">
                            {pIdx + 1}
                          </span>
                          <PartyIcon
                            slug={party.partySlug}
                            iconFileName={party.partyIconFileName ?? undefined}
                            name={party.partyName}
                            size={20}
                            className="shrink-0"
                          />
                          <span className="text-xs text-slate-700 flex-1 truncate font-medium">
                            {party.partyName}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ANSWER_BADGE[partyAns]}`}
                          >
                            {LABELS[partyAns]}
                          </span>
                          <span className={`text-xs w-4 text-right shrink-0 ${icon.cls}`}>
                            {icon.symbol}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
