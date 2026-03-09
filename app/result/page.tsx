"use client"

import Image from "next/image"
import Link from "next/link"
import { ResultList } from "@/components/ResultList"
import { RotateCcw, Share2, Trophy, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const mockResults = [
  { name: "Partido Morado", percentage: 78 },
  { name: "Acción Popular", percentage: 65 },
  { name: "Alianza para el Progreso", percentage: 58 },
  { name: "Fuerza Popular", percentage: 45 },
  { name: "Perú Libre", percentage: 42 },
  { name: "Renovación Popular", percentage: 38 },
  { name: "Juntos por el Perú", percentage: 35 },
  { name: "Podemos Perú", percentage: 28 },
]

export default function ResultPage() {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Votamatch Perú 2026",
        text: "¡Descubre con qué partido coincides!",
        url: window.location.origin,
      })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8 px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5B8FCB]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EF4444]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative">
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

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B8FCB] to-[#4A7DB8] flex items-center justify-center">
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
          className="bg-gradient-to-r from-[#5B8FCB] to-[#4A7DB8] rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Mayor coincidencia</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{mockResults[0].name}</span>
            <span className="text-3xl font-bold">{mockResults[0].percentage}%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <ResultList results={mockResults.slice(1)} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
            Repetir cuestionario
          </Link>
          <button
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#5B8FCB] to-[#4A7DB8] text-white font-medium hover:shadow-lg hover:shadow-[#5B8FCB]/25 transition-all duration-200"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
            Compartir resultados
          </button>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-slate-400 mt-8"
        >
          Estos resultados son orientativos y se basan en las posiciones públicas de los partidos.
        </motion.p>
      </div>
    </main>
  )
}
