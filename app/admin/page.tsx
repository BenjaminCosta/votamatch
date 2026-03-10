"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FileText, Building2, MessageSquare, Type, Menu, X, Plus, Search, Home, ChevronRight, Trash2, Save, LogOut, User, UploadCloud } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { EmptyState } from "@/components/EmptyState"
import { ImportExportSection } from "@/components/ImportExportSection"
import { useToast } from "@/components/Toast"
import { useAuth } from "@/providers/AuthProvider"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getQuestions, addQuestion, deleteQuestion } from "@/lib/firestore/questions"
import { getParties, addParty, deleteParty, nameToSlug } from "@/lib/firestore/parties"
import { getPartyAnswers, addPartyAnswer, deletePartyAnswer } from "@/lib/firestore/partyAnswers"
import { getSiteTexts, saveSiteTexts } from "@/lib/firestore/siteTexts"
import type { Question, Party, PartyAnswer, SiteTexts } from "@/lib/types"
import { DEFAULT_SITE_TEXTS } from "@/lib/types"

const sidebarItems = [
  { id: "questions", label: "Preguntas", icon: FileText },
  { id: "parties", label: "Partidos", icon: Building2 },
  { id: "answers", label: "Respuestas", icon: MessageSquare },
  { id: "texts", label: "Textos", icon: Type },
  { id: "import-export", label: "Importar / Exportar", icon: UploadCloud },
]

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Economía": { bg: "bg-[#5B8FCB]/10", text: "text-[#5B8FCB]" },
  "Social": { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]" },
  "Educación": { bg: "bg-[#5B8FCB]/10", text: "text-[#5B8FCB]" },
  "Seguridad": { bg: "bg-[#6B7280]/10", text: "text-[#6B7280]" },
}

export default function AdminPage() {
  const router = useRouter()
  const { addToast } = useToast()
  
  // All hooks must be called unconditionally at the top
  const { user, loading } = useAuth()
  const [activeSection, setActiveSection] = useState("questions")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState({ externalId: "", text: "", category: "Economía", code: "", notes: "" })

  // Parties state
  const [parties, setParties] = useState<Party[]>([])
  const [newParty, setNewParty] = useState({ name: "", color: "#5B8FCB" })

  // Answers state
  const [answers, setAnswers] = useState<PartyAnswer[]>([])
  const [newAnswer, setNewAnswer] = useState({ partyId: "", questionExternalId: "", answer: "yes" as "yes" | "no" | "neutral" })

  // Texts state
  const [texts, setTexts] = useState<SiteTexts>(DEFAULT_SITE_TEXTS)
  const [savingTexts, setSavingTexts] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [loading, user, router])

  // Load data when tab changes
  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    const loaders: Record<string, () => Promise<void>> = {
      questions: () => getQuestions().then(setQuestions),
      parties: () =>
        // Also load answers + questions so the progress bar denominator is accurate
        Promise.all([getParties(), getPartyAnswers(), getQuestions()]).then(([pts, ans, qs]) => {
          setParties(pts)
          setAnswers(ans)
          setQuestions(qs)
        }),
      answers: () =>
        // Load questions too so the Add Answer modal dropdown is populated
        Promise.all([getPartyAnswers(), getParties(), getQuestions()]).then(([ans, pts, qs]) => {
          setAnswers(ans)
          setParties(pts)
          setQuestions(qs)
        }),
      texts: () => getSiteTexts().then(setTexts),
    }
    ;(loaders[activeSection] ?? (() => Promise.resolve()))()
      .catch((err) => console.error("[admin] load error:", err))
      .finally(() => setDataLoading(false))
  }, [activeSection, user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/admin/login")
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) return
    try {
      await addQuestion({
        externalId: newQuestion.externalId.trim() || String(Date.now()),
        text: newQuestion.text.trim(),
        category: newQuestion.category,
        code: newQuestion.code.trim(),
        notes: newQuestion.notes.trim(),
        order: questions.length,
        active: true,
      })
      setNewQuestion({ externalId: "", text: "", category: "Economía", code: "", notes: "" })
      setShowAddModal(false)
      const updated = await getQuestions()
      setQuestions(updated)
      addToast("Pregunta agregada correctamente", "success")
    } catch {
      addToast("Error al agregar pregunta", "error")
    }
  }

  const handleAddParty = async () => {
    if (!newParty.name.trim()) return
    try {
      await addParty({ name: newParty.name.trim(), slug: nameToSlug(newParty.name), color: newParty.color, active: true })
      setNewParty({ name: "", color: "#5B8FCB" })
      setShowAddModal(false)
      const updated = await getParties()
      setParties(updated)
      addToast("Partido agregado correctamente", "success")
    } catch {
      addToast("Error al agregar partido", "error")
    }
  }

  const handleAddAnswer = async () => {
    if (!newAnswer.partyId || !newAnswer.questionExternalId) return
    try {
      await addPartyAnswer({ partyId: newAnswer.partyId, questionExternalId: newAnswer.questionExternalId, answer: newAnswer.answer })
      setNewAnswer({ partyId: "", questionExternalId: "", answer: "yes" })
      setShowAddModal(false)
      const updated = await getPartyAnswers()
      setAnswers(updated)
      addToast("Respuesta agregada correctamente", "success")
    } catch {
      addToast("Error al agregar respuesta", "error")
    }
  }

  const handleDeleteQuestion = async (docId: string) => {
    try {
      await deleteQuestion(docId)
      setQuestions((prev) => prev.filter((q) => q.docId !== docId))
      addToast("Pregunta eliminada", "info")
    } catch {
      addToast("Error al eliminar pregunta", "error")
    }
  }

  const handleDeleteParty = async (docId: string) => {
    try {
      await deleteParty(docId)
      setParties((prev) => prev.filter((p) => p.docId !== docId))
      addToast("Partido eliminado", "info")
    } catch {
      addToast("Error al eliminar partido", "error")
    }
  }

  const handleDeleteAnswer = async (docId: string) => {
    try {
      await deletePartyAnswer(docId)
      setAnswers((prev) => prev.filter((a) => a.docId !== docId))
      addToast("Respuesta eliminada", "info")
    } catch {
      addToast("Error al eliminar respuesta", "error")
    }
  }

  const handleSaveTexts = async () => {
    setSavingTexts(true)
    try {
      await saveSiteTexts(texts)
      addToast("Textos guardados correctamente", "success")
    } catch {
      addToast("Error al guardar textos", "error")
    } finally {
      setSavingTexts(false)
    }
  }

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAnswers = answers.filter(a => {
    const q = searchQuery.toLowerCase()
    return (
      parties.find(p => p.docId === a.partyId)?.name.toLowerCase().includes(q) ||
      questions.find(q2 => q2.externalId === a.questionExternalId)?.text.toLowerCase().includes(q)
    )
  })

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#5B8FCB] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-[#6B7280]/10"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5 text-[#111111]" /> : <Menu className="w-5 h-5 text-[#111111]" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-[#111111]/20 backdrop-blur-sm z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111111]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-[#111111] mb-6">
                Agregar {activeSection === "questions" ? "Pregunta" : activeSection === "parties" ? "Partido" : "Respuesta"}
              </h2>

              {activeSection === "questions" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">ID externo</label>
                    <input
                      type="text"
                      value={newQuestion.externalId}
                      onChange={(e) => setNewQuestion({ ...newQuestion, externalId: e.target.value })}
                      placeholder="Ej: P001"
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Pregunta</label>
                    <textarea
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      placeholder="Escribe la pregunta..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all resize-none text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Categoría</label>
                    <input
                      type="text"
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      placeholder="Economía, Social, Educación..."
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    />
                  </div>
                  <button
                    onClick={handleAddQuestion}
                    className="w-full py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors"
                  >
                    Agregar Pregunta
                  </button>
                </div>
              )}

              {activeSection === "parties" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Nombre del Partido</label>
                    <input
                      type="text"
                      value={newParty.name}
                      onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                      placeholder="Nombre del partido..."
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Color</label>
                    <div className="flex gap-3">
                      {["#5B8FCB", "#EF4444", "#6B7280", "#111111"].map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewParty({ ...newParty, color })}
                          className={`w-10 h-10 rounded-xl transition-all ${newParty.color === color ? "ring-2 ring-offset-2 ring-[#5B8FCB]" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAddParty}
                    className="w-full py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors"
                  >
                    Agregar Partido
                  </button>
                </div>
              )}

              {activeSection === "answers" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Partido</label>
                    <select
                      value={newAnswer.partyId}
                      onChange={(e) => setNewAnswer({ ...newAnswer, partyId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    >
                      <option value="">Seleccionar partido...</option>
                      {parties.map((p) => (
                        <option key={p.docId} value={p.docId}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">ID de Pregunta</label>
                    <select
                      value={newAnswer.questionExternalId}
                      onChange={(e) => setNewAnswer({ ...newAnswer, questionExternalId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    >
                      <option value="">Seleccionar pregunta...</option>
                      {questions.map((q) => (
                        <option key={q.docId} value={q.externalId}>{q.externalId} - {q.text.substring(0, 40)}...</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Respuesta</label>
                    <div className="flex gap-2">
                      {(["yes", "no", "neutral"] as const).map((ans) => (
                        <button
                          key={ans}
                          onClick={() => setNewAnswer({ ...newAnswer, answer: ans })}
                          className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                            newAnswer.answer === ans
                              ? ans === "yes" ? "bg-[#5B8FCB] text-white" : ans === "no" ? "bg-[#EF4444] text-white" : "bg-[#6B7280] text-white"
                              : "bg-[#F5F7FA] text-[#6B7280] hover:bg-[#6B7280]/10"
                          }`}
                        >
                          {ans === "yes" ? "Sí" : ans === "no" ? "No" : "Neutral"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAddAnswer}
                    className="w-full py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors"
                  >
                    Agregar Respuesta
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#6B7280]/10 transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#6B7280]/10">
            <Link href="/" className="block">
              <Image
                src="/logo_votamatch.png"
                alt="Votamatch Perú 2026"
                width={150}
                height={75}
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 mb-3">
              Administración
            </p>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setMobileMenuOpen(false)
                  setSearchQuery("")
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeSection === item.id
                    ? "bg-[#5B8FCB] text-white shadow-lg shadow-[#5B8FCB]/20"
                    : "text-[#6B7280] hover:bg-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeSection === item.id ? "text-white" : "text-[#6B7280] group-hover:text-[#111111]"}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {(item.id === "questions" || item.id === "parties" || item.id === "answers") && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeSection === item.id
                      ? "bg-white/20 text-white"
                      : "bg-[#F5F7FA] text-[#6B7280]"
                  }`}>
                    {item.id === "questions" ? questions.length : item.id === "parties" ? parties.length : answers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#6B7280]/10 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6B7280] hover:bg-[#F5F7FA] transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Volver al inicio</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-[#6B7280]/10 px-4 lg:px-8 py-4 pt-16 lg:pt-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#111111]">Panel de administración</h1>
              <p className="text-sm text-[#6B7280]">Gestiona preguntas, partidos y contenidos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7FA]">
                <User className="w-4 h-4 text-[#6B7280]" />
                <span className="text-sm text-[#111111] font-medium">{user.email?.split("@")[0] ?? "Admin"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            >
              <div>
                <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-1">
                  <span>Admin</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[#111111]">{sidebarItems.find((item) => item.id === activeSection)?.label}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#111111]">
                  {sidebarItems.find((item) => item.id === activeSection)?.label}
                </h2>
              </div>
            
              <div className="flex items-center gap-3">
                {/* Search */}
                {activeSection !== "texts" && activeSection !== "import-export" && (
                  <div className="relative">
                    <Search className="w-5 h-5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all w-48 text-[#111111] bg-white"
                    />
                  </div>
                )}
                {/* Add button */}
                {activeSection !== "texts" && activeSection !== "import-export" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors shadow-lg shadow-[#5B8FCB]/20"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Questions Section */}
                {activeSection === "questions" && (
                  <div className="space-y-3">
                    {dataLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-[#5B8FCB] border-t-transparent rounded-full" />
                      </div>
                    ) : filteredQuestions.length === 0 ? (
                      <EmptyState
                        type="questions"
                        onAction={() => setShowAddModal(true)}
                      />
                    ) : (
                      filteredQuestions.map((question, index) => (
                        <motion.div
                          key={question.docId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="bg-white rounded-xl p-4 border border-[#6B7280]/10 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-[#6B7280] bg-[#F5F7FA] px-2 py-1 rounded-lg">
                                  {question.externalId || `#${index + 1}`}
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${categoryColors[question.category]?.bg || "bg-[#F5F7FA]"} ${categoryColors[question.category]?.text || "text-[#6B7280]"}`}>
                                  {question.category}
                                </span>
                              </div>
                              <p className="text-[#111111] font-medium">{question.text}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDeleteQuestion(question.docId)}
                                className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Parties Section */}
                {activeSection === "parties" && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {dataLoading ? (
                      <div className="md:col-span-2 flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-[#5B8FCB] border-t-transparent rounded-full" />
                      </div>
                    ) : filteredParties.length === 0 ? (
                      <div className="md:col-span-2">
                        <EmptyState
                          type="parties"
                          onAction={() => setShowAddModal(true)}
                        />
                      </div>
                    ) : (
                      filteredParties.map((party, index) => {
                        const answerCount = answers.filter((a) => a.partyId === party.docId).length
                        return (
                          <motion.div
                            key={party.docId}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl p-5 border border-[#6B7280]/10 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                  style={{ backgroundColor: party.color ?? "#6B7280" }}
                                >
                                  {party.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-[#111111]">{party.name}</h3>
                                  <p className="text-sm text-[#6B7280]">{answerCount} respuestas</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDeleteParty(party.docId)}
                                  className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="w-full bg-[#F5F7FA] rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min((answerCount / Math.max(questions.length, 1)) * 100, 100)}%`,
                                  backgroundColor: party.color ?? "#6B7280",
                                }}
                              />
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Answers Section */}
                {activeSection === "answers" && (
                  <div className="bg-white rounded-xl border border-[#6B7280]/10 overflow-hidden">
                    {dataLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-[#5B8FCB] border-t-transparent rounded-full" />
                      </div>
                    ) : filteredAnswers.length === 0 ? (
                      <EmptyState
                        type="answers"
                        onAction={() => setShowAddModal(true)}
                      />
                    ) : (
                      <table className="w-full">
                        <thead className="bg-[#F5F7FA]">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Partido</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">ID Pregunta</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Respuesta</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B7280]">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#6B7280]/10">
                          {filteredAnswers.map((answer) => {
                            const partyName = parties.find((p) => p.docId === answer.partyId)?.name ?? answer.partyId
                            return (
                              <tr key={answer.docId} className="hover:bg-[#F5F7FA]/50 transition-colors group">
                                <td className="py-3 px-4 text-sm font-medium text-[#111111]">{partyName}</td>
                                <td className="py-3 px-4 text-sm text-[#6B7280]">{answer.questionExternalId}</td>
                                <td className="py-3 px-4">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                                    answer.answer === "yes" ? "bg-[#5B8FCB]/10 text-[#5B8FCB]" :
                                    answer.answer === "no" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                                    "bg-[#6B7280]/10 text-[#6B7280]"
                                  }`}>
                                    {answer.answer === "yes" ? "Sí" : answer.answer === "no" ? "No" : "Neutral"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => handleDeleteAnswer(answer.docId)}
                                      className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Texts Section */}
                {activeSection === "texts" && (
                  <div className="bg-white rounded-xl p-6 border border-[#6B7280]/10">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Título principal
                        </label>
                        <input
                          type="text"
                          value={texts.introTitle}
                          onChange={(e) => setTexts({ ...texts, introTitle: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Descripción intro
                        </label>
                        <textarea
                          value={texts.introText}
                          onChange={(e) => setTexts({ ...texts, introText: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all resize-none text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Disclaimer intro
                        </label>
                        <input
                          type="text"
                          value={texts.introDisclaimer}
                          onChange={(e) => setTexts({ ...texts, introDisclaimer: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Disclaimer resultados
                        </label>
                        <textarea
                          value={texts.resultDisclaimer}
                          onChange={(e) => setTexts({ ...texts, resultDisclaimer: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all resize-none text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Email de contacto
                        </label>
                        <input
                          type="email"
                          value={texts.contactEmail}
                          onChange={(e) => setTexts({ ...texts, contactEmail: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                        />
                      </div>
                      <button 
                        onClick={handleSaveTexts}
                        disabled={savingTexts}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors disabled:opacity-60"
                      >
                        <Save className="w-5 h-5" />
                        {savingTexts ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Import / Export Section */}
                {activeSection === "import-export" && (
                  <ImportExportSection onToast={addToast} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
