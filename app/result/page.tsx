"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ResultList } from "@/components/ResultList"
import { PartyIcon } from "@/components/PartyIcon"
import { ResultsDisclaimer } from "@/components/ResultsDisclaimer"
import { DetailedComparison } from "@/components/DetailedComparison"
import { getPartyColor } from "@/lib/party-colors"
import { RotateCcw, Trophy, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import {
  readSessionResults,
  clearSessionResults,
  readDetailedData,
  clearDetailedData,
} from "@/lib/sessionResults"
import type { MatchResult } from "@/lib/types"
import type { DetailedQuizData } from "@/lib/sessionResults"

export default function ResultPage() {
  const router = useRouter()
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [detailedData, setDetailedData] = useState<DetailedQuizData | null>(null)
  const [ready, setReady] = useState(false)
  // Guard against React 18 Strict Mode running the effect twice:
  // first run reads + clears session; without this flag the second run
  // would find an empty session and redirect straight back to /quiz.
  const hasRead = useRef(false)

  useEffect(() => {
    if (hasRead.current) return
    hasRead.current = true

    console.log("[result] reading sessionStorage")
    const data = readSessionResults()
    console.log("[result] data found:", data)

    if (!data) {
      console.log("[result] no session data — redirecting to /quiz")
      router.replace("/quiz")
      return
    }
    setResults(data)
    setDetailedData(readDetailedData())
    setReady(true)
    // Clear after reading so a hard refresh doesn't re-show stale results
    clearSessionResults()
    clearDetailedData()
  }, [router])

  // While reading sessionStorage / redirecting
  if (!ready || !results) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5B8FCB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const topMatch = results[0]
  const rest = results.slice(1)

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50 py-8 px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5B8FCB]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EF4444]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="inline-block">
            <Image
              src="/logo_votamatch.png"
              alt="Votamatch Perú 2026"
              width={140}
              height={70}
              className="mx-auto"
            />
          </Link>
        </motion.div>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#5B8FCB] to-[#4A7DB8] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 text-center text-balance">
            ¡Tus resultados están listos!
          </h1>
          <p className="text-slate-500 text-center">
            Basado en tus respuestas, estos son los partidos con los que más coincides
          </p>
        </motion.div>

        {/* Top match highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${getPartyColor(topMatch.partySlug ?? "")}, ${getPartyColor(topMatch.partySlug ?? "")}cc)` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Mayor coincidencia</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <PartyIcon
                slug={topMatch.partySlug ?? ""}
                iconFileName={topMatch.partyIconFileName ?? undefined}
                name={topMatch.partyName}
                size={52}
                className="shrink-0"
              />
              <span className="text-xl font-bold truncate">{topMatch.partyName}</span>
            </div>
            <span className="text-3xl font-bold shrink-0 ml-3">{topMatch.percentage}%</span>
          </div>
        </motion.div>

        {/* Full ranking */}
        {rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <ResultList
              results={rest.map((r) => ({
                partyId: r.partyId,
                name: r.partyName,
                percentage: r.percentage,
                partySlug: r.partySlug ?? "",
                partyIconFileName: r.partyIconFileName ?? null,
              }))}
            />
          </motion.div>
        )}

        {/* Detailed question-by-question comparison */}
        {detailedData && (
          <div className="mb-6">
            <DetailedComparison data={detailedData} results={results} />
          </div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
            Repetir cuestionario
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ResultsDisclaimer />
        </motion.div>

        {/* Footer nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 flex justify-center gap-5 text-xs text-slate-400"
        >
          <Link href="/metodologia" className="hover:text-slate-600 transition-colors underline underline-offset-2">
            Metodología
          </Link>
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Inicio
          </Link>
        </motion.div>
      </div>
    </main>
  )
}