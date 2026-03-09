"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FileText, Building2, MessageSquare, Type, Menu, X, Plus, Search, Home, ChevronRight, Edit2, Trash2, Save, LogOut, User, UploadCloud } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { EmptyState } from "@/components/EmptyState"
import { ImportExportSection } from "@/components/ImportExportSection"
import { useToast } from "@/components/Toast"

const initialQuestions = [
  { id: 1, text: "¿Deberían aumentarse los impuestos a las grandes empresas?", category: "Economía" },
  { id: 2, text: "¿Está de acuerdo con legalizar el uso recreativo de la marihuana?", category: "Social" },
  { id: 3, text: "¿Debería el Estado invertir más en educación pública?", category: "Educación" },
  { id: 4, text: "¿Apoya la construcción de más cárceles para reducir la delincuencia?", category: "Seguridad" },
  { id: 5, text: "¿Cree que debería permitirse el matrimonio entre personas del mismo sexo?", category: "Social" },
]

const initialParties = [
  { id: 1, name: "Partido Morado", questions: 33, color: "#5B8FCB" },
  { id: 2, name: "Acción Popular", questions: 33, color: "#EF4444" },
  { id: 3, name: "Fuerza Popular", questions: 30, color: "#6B7280" },
  { id: 4, name: "Alianza para el Progreso", questions: 28, color: "#5B8FCB" },
  { id: 5, name: "Perú Libre", questions: 25, color: "#EF4444" },
]

const initialAnswers = [
  { id: 1, party: "Partido Morado", question: 1, answer: "Sí" },
  { id: 2, party: "Acción Popular", question: 1, answer: "No" },
  { id: 3, party: "Fuerza Popular", question: 1, answer: "Neutral" },
  { id: 4, party: "Partido Morado", question: 2, answer: "Sí" },
  { id: 5, party: "Acción Popular", question: 2, answer: "No" },
]

const sidebarItems = [
  { id: "questions", label: "Preguntas", icon: FileText, count: 33 },
  { id: "parties", label: "Partidos", icon: Building2, count: 8 },
  { id: "answers", label: "Respuestas", icon: MessageSquare, count: 264 },
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [activeSection, setActiveSection] = useState("questions")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // State for questions
  const [questions, setQuestions] = useState(initialQuestions)
  const [newQuestion, setNewQuestion] = useState({ text: "", category: "Economía" })

  // State for parties
  const [parties, setParties] = useState(initialParties)
  const [newParty, setNewParty] = useState({ name: "", color: "#5B8FCB" })

  // State for answers
  const [answers, setAnswers] = useState(initialAnswers)
  const [newAnswer, setNewAnswer] = useState({ party: "", question: 1, answer: "Sí" })

  // State for texts
  const [texts, setTexts] = useState({
    title: "Descubre con qué partido coincides",
    description: "Responde 33 preguntas sobre temas clave del país. Te tomará menos de 5 minutos.",
    buttonText: "Comenzar cuestionario",
    resultsMessage: "¡Tus resultados están listos! Basado en tus respuestas, estos son los partidos con los que más coincides.",
  })

  // Auth check
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("votamatch_admin_logged")
    if (isLoggedIn !== "true") {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("votamatch_admin_logged")
    router.push("/admin/login")
  }

  const handleAddQuestion = () => {
    if (newQuestion.text.trim()) {
      setQuestions([...questions, { id: questions.length + 1, ...newQuestion }])
      setNewQuestion({ text: "", category: "Economía" })
      setShowAddModal(false)
      addToast("Pregunta agregada correctamente", "success")
    }
  }

  const handleAddParty = () => {
    if (newParty.name.trim()) {
      setParties([...parties, { id: parties.length + 1, questions: 0, ...newParty }])
      setNewParty({ name: "", color: "#5B8FCB" })
      setShowAddModal(false)
      addToast("Partido agregado correctamente", "success")
    }
  }

  const handleAddAnswer = () => {
    if (newAnswer.party.trim()) {
      setAnswers([...answers, { id: answers.length + 1, ...newAnswer }])
      setNewAnswer({ party: "", question: 1, answer: "Sí" })
      setShowAddModal(false)
      addToast("Respuesta agregada correctamente", "success")
    }
  }

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id))
    addToast("Pregunta eliminada", "info")
  }

  const handleDeleteParty = (id: number) => {
    setParties(parties.filter(p => p.id !== id))
    addToast("Partido eliminado", "info")
  }

  const handleDeleteAnswer = (id: number) => {
    setAnswers(answers.filter(a => a.id !== id))
    addToast("Respuesta eliminada", "info")
  }

  const handleSaveTexts = () => {
    addToast("Textos guardados correctamente", "success")
  }

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAnswers = answers.filter(a => 
    a.party.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Show loading while checking auth
  if (isAuthenticated === null) {
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
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    >
                      <option value="Economía">Economía</option>
                      <option value="Social">Social</option>
                      <option value="Educación">Educación</option>
                      <option value="Seguridad">Seguridad</option>
                    </select>
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
                      value={newAnswer.party}
                      onChange={(e) => setNewAnswer({ ...newAnswer, party: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    >
                      <option value="">Seleccionar partido...</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Pregunta</label>
                    <select
                      value={newAnswer.question}
                      onChange={(e) => setNewAnswer({ ...newAnswer, question: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                    >
                      {questions.map((q) => (
                        <option key={q.id} value={q.id}>#{q.id} - {q.text.substring(0, 40)}...</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Respuesta</label>
                    <div className="flex gap-2">
                      {["Sí", "No", "Neutral"].map((ans) => (
                        <button
                          key={ans}
                          onClick={() => setNewAnswer({ ...newAnswer, answer: ans })}
                          className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                            newAnswer.answer === ans
                              ? ans === "Sí" ? "bg-[#5B8FCB] text-white" : ans === "No" ? "bg-[#EF4444] text-white" : "bg-[#6B7280] text-white"
                              : "bg-[#F5F7FA] text-[#6B7280] hover:bg-[#6B7280]/10"
                          }`}
                        >
                          {ans}
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
                {item.count && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeSection === item.id
                      ? "bg-white/20 text-white"
                      : "bg-[#F5F7FA] text-[#6B7280]"
                  }`}>
                    {item.id === "questions" ? questions.length : item.id === "parties" ? parties.length : item.id === "answers" ? answers.length : item.count}
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
                <span className="text-sm text-[#111111] font-medium">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
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
                    {filteredQuestions.length === 0 ? (
                      <EmptyState
                        type="questions"
                        onAction={() => setShowAddModal(true)}
                      />
                    ) : (
                      filteredQuestions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-4 border border-[#6B7280]/10 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-[#6B7280] bg-[#F5F7FA] px-2 py-1 rounded-lg">
                                  #{question.id}
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${categoryColors[question.category]?.bg || "bg-[#F5F7FA]"} ${categoryColors[question.category]?.text || "text-[#6B7280]"}`}>
                                  {question.category}
                                </span>
                              </div>
                              <p className="text-[#111111] font-medium">{question.text}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 rounded-lg hover:bg-[#5B8FCB]/10 text-[#5B8FCB] transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteQuestion(question.id)}
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
                    {filteredParties.length === 0 ? (
                      <div className="md:col-span-2">
                        <EmptyState
                          type="parties"
                          onAction={() => setShowAddModal(true)}
                        />
                      </div>
                    ) : (
                      filteredParties.map((party, index) => (
                        <motion.div
                          key={party.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-5 border border-[#6B7280]/10 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: party.color }}
                              >
                                {party.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#111111]">{party.name}</h3>
                                <p className="text-sm text-[#6B7280]">{party.questions} respuestas</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 rounded-lg hover:bg-[#5B8FCB]/10 text-[#5B8FCB] transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteParty(party.id)}
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
                                width: `${(party.questions / 33) * 100}%`,
                                backgroundColor: party.color 
                              }}
                            />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Answers Section */}
                {activeSection === "answers" && (
                  <div className="bg-white rounded-xl border border-[#6B7280]/10 overflow-hidden">
                    {filteredAnswers.length === 0 ? (
                      <EmptyState
                        type="answers"
                        onAction={() => setShowAddModal(true)}
                      />
                    ) : (
                      <table className="w-full">
                        <thead className="bg-[#F5F7FA]">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">#</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Partido</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Pregunta</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Respuesta</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B7280]">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#6B7280]/10">
                          {filteredAnswers.map((answer) => (
                            <tr key={answer.id} className="hover:bg-[#F5F7FA]/50 transition-colors group">
                              <td className="py-3 px-4 text-sm text-[#6B7280]">{answer.id}</td>
                              <td className="py-3 px-4 text-sm font-medium text-[#111111]">{answer.party}</td>
                              <td className="py-3 px-4 text-sm text-[#6B7280]">Pregunta #{answer.question}</td>
                              <td className="py-3 px-4">
                                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                                  answer.answer === "Sí" ? "bg-[#5B8FCB]/10 text-[#5B8FCB]" :
                                  answer.answer === "No" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                                  "bg-[#6B7280]/10 text-[#6B7280]"
                                }`}>
                                  {answer.answer}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 rounded-lg hover:bg-[#5B8FCB]/10 text-[#5B8FCB] transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                    className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
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
                          value={texts.title}
                          onChange={(e) => setTexts({ ...texts, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={texts.description}
                          onChange={(e) => setTexts({ ...texts, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all resize-none text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Texto del botón
                        </label>
                        <input
                          type="text"
                          value={texts.buttonText}
                          onChange={(e) => setTexts({ ...texts, buttonText: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-2">
                          Mensaje de resultados
                        </label>
                        <textarea
                          value={texts.resultsMessage}
                          onChange={(e) => setTexts({ ...texts, resultsMessage: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#6B7280]/20 focus:border-[#5B8FCB] focus:ring-2 focus:ring-[#5B8FCB]/20 outline-none transition-all resize-none text-[#111111]"
                        />
                      </div>
                      <button 
                        onClick={handleSaveTexts}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Guardar cambios
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
