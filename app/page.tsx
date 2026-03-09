"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, Shield, ChevronRight } from "lucide-react"


export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-[#5B8FCB]/10 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EF4444]/10 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B8FCB]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-lg text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <Image
            src="/logo_votamatch.png"
            alt="Votamatch Perú 2026"
            width={300}
            height={200}
            className="mx-auto drop-shadow-sm"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance leading-tight">
            Descubre con qué partido{" "}
            <span className="text-[#5B8FCB]">coincides</span>
          </h1>

          <p className="text-slate-500 mb-8 leading-relaxed text-lg">
            Responde preguntas sobre los temas más importantes del país y descubre qué partido representa mejor tus ideas.
          </p>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            href="/quiz"
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-[#5B8FCB] to-[#4A7DB8] hover:from-[#4A7DB8] hover:to-[#3A6DA8] text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-[#5B8FCB]/25 hover:shadow-xl hover:shadow-[#5B8FCB]/30 hover:-translate-y-0.5"
          >
            Comenzar cuestionario
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-sm text-slate-400 mt-8"
        >
          Tus respuestas son completamente anónimas y no se almacenan
        </motion.p>
      </div>
    </main>
  )
}
