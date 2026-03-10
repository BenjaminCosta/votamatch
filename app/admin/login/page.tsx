"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/providers/AuthProvider"

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email": return "El correo electrónico no es válido."
    case "auth/user-not-found": return "No existe una cuenta con ese correo."
    case "auth/wrong-password": return "Contraseña incorrecta."
    case "auth/invalid-credential": return "Credenciales incorrectas. Verifica e intenta de nuevo."
    case "auth/too-many-requests": return "Demasiados intentos fallidos. Espera unos minutos."
    case "auth/user-disabled": return "Esta cuenta ha sido deshabilitada."
    default: return "Error al iniciar sesión. Intenta de nuevo."
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B8FCB]" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/admin")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ""
      setError(getAuthErrorMessage(code))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5B8FCB]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EF4444]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-[#6B7280]/10 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo_votamatch.png"
              alt="Votamatch Perú 2026"
              width={140}
              height={70}
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#111111] mb-2">
              Acceso administrador
            </h1>
            <p className="text-[#6B7280] text-sm">
              Ingresa para gestionar preguntas, partidos y contenidos.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20"
              >
                <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
                <p className="text-sm text-[#EF4444]">{error}</p>
              </motion.div>
            )}

            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#111111] mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@votamatch.pe"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 bg-white text-[#111111] placeholder-[#6B7280]/50 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all"
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#111111] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#6B7280]/20 bg-white text-[#111111] placeholder-[#6B7280]/50 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#5B8FCB] text-white font-semibold hover:bg-[#4A7DB8] focus:ring-2 focus:ring-[#5B8FCB]/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#5B8FCB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
