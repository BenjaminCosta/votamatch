"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/logo_votamatch.png"
              alt="Votamatch Perú 2026"
              width={150}
              height={75}
              className="mx-auto"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-[#6B7280]/10"
        >
          <div className="w-20 h-20 bg-[#5B8FCB]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-[#5B8FCB]" />
          </div>

          <h1 className="text-6xl font-bold text-[#111111] mb-2">404</h1>
          <h2 className="text-xl font-semibold text-[#111111] mb-3">Página no encontrada</h2>
          <p className="text-[#6B7280] mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors shadow-lg shadow-[#5B8FCB]/20"
            >
              <Home className="w-5 h-5" />
              Ir al inicio
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#6B7280]/20 text-[#6B7280] font-medium hover:bg-[#F5F7FA] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver atrás
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-[#6B7280] mt-6"
        >
          Si crees que esto es un error, contáctanos.
        </motion.p>
      </div>
    </main>
  )
}
