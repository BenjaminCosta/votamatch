"use client"

import { useState, useRef } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  parseFile,
  exportQuestions,
  exportParties,
  exportPartyAnswers,
  exportResponses,
  type ParseResult,
  type ParseRowError,
} from "@/lib/importExport"
import { importQuestions, getQuestions } from "@/lib/firestore/questions"
import { importParties, getParties } from "@/lib/firestore/parties"
import { importPartyAnswers, getPartyAnswers } from "@/lib/firestore/partyAnswers"
import { getResponses } from "@/lib/firestore/responses"

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void
}

export function ImportExportSection({ onToast }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [parseErrors, setParseErrors] = useState<ParseRowError[]>([])
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      onToast("Formato no soportado. Usa .xlsx, .xls o .csv", "error")
      return
    }
    setFileName(file.name)
    setParseResult(null)
    setParseErrors([])
    try {
      const result = await parseFile(file)
      setParseResult(result)
      setParseErrors(result.errors)
    } catch {
      onToast("Error al leer el archivo. Verifica el formato.", "error")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (!parseResult) return
    const { questions, parties, answers } = parseResult
    if (questions.length === 0 && parties.length === 0) return
    setImporting(true)
    try {
      // Step 1: upsert questions
      if (questions.length > 0) await importQuestions(questions)

      // Step 2: upsert parties → get name→docId map
      const nameToDocId =
        parties.length > 0 ? await importParties(parties) : new Map<string, string>()

      // Step 3: resolve partyId in answers and upsert
      let importedAnswerCount = 0
      if (answers.length > 0) {
        const resolved = answers.flatMap((a) => {
          const partyId = nameToDocId.get(a.partyName)
          if (!partyId) return []
          return [{ partyId, questionExternalId: a.questionExternalId, answer: a.answer }]
        })
        if (resolved.length > 0) await importPartyAnswers(resolved)
        importedAnswerCount = resolved.length
      }

      onToast(
        `Importado: ${questions.length} preguntas, ${parties.length} partidos, ${importedAnswerCount} respuestas`,
        "success",
      )
      setParseResult(null)
      setParseErrors([])
      setFileName(null)
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : "Error al importar. Intenta nuevamente.",
        "error",
      )
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async (type: "questions" | "parties" | "answers" | "responses") => {
    setExporting(type)
    try {
      if (type === "questions") {
        exportQuestions(await getQuestions())
      } else if (type === "parties") {
        exportParties(await getParties())
      } else if (type === "answers") {
        const [answers, parties, questions] = await Promise.all([
          getPartyAnswers(),
          getParties(),
          getQuestions(),
        ])
        exportPartyAnswers(answers, parties, questions)
      } else if (type === "responses") {
        exportResponses(await getResponses())
      }
      onToast("Archivo descargado correctamente", "success")
    } catch {
      onToast("Error al exportar datos", "error")
    } finally {
      setExporting(null)
    }
  }

  const exportItems = [
    { id: "questions" as const, label: "Preguntas", description: "Todas las preguntas del quiz" },
    { id: "parties" as const, label: "Partidos", description: "Lista de partidos registrados" },
    { id: "answers" as const, label: "Respuestas de partidos", description: "Respuestas cruzadas por partido" },
    { id: "responses" as const, label: "Participaciones", description: "Resultados de usuarios" },
  ]

  return (
    <div className="space-y-8">
      {/* Import */}
      <div className="bg-white rounded-2xl border border-[#6B7280]/10 p-6">
        <h3 className="text-lg font-bold text-[#111111] mb-1">Importar Excel</h3>
        <p className="text-sm text-[#6B7280] mb-6">
          Sube el Excel del cliente. Debe contener las hojas{" "}
          <span className="font-mono text-xs bg-[#F5F7FA] px-1 rounded">preguntas</span> y{" "}
          <span className="font-mono text-xs bg-[#F5F7FA] px-1 rounded">partidos_respuestas</span>.
          Las hojas <span className="font-mono text-xs bg-[#F5F7FA] px-1 rounded">trazabilidad</span> y{" "}
          <span className="font-mono text-xs bg-[#F5F7FA] px-1 rounded">notas</span> se ignoran.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? "border-[#5B8FCB] bg-[#5B8FCB]/5"
              : "border-[#6B7280]/20 hover:border-[#5B8FCB]/50 hover:bg-[#F5F7FA]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0])
            }}
          />
          <Upload className="w-8 h-8 text-[#6B7280] mx-auto mb-3" />
          {fileName ? (
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#5B8FCB]" />
              <span className="text-[#111111] font-medium">{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFileName(null)
                  setParseResult(null)
                  setParseErrors([])
                }}
                className="p-0.5 rounded-full hover:bg-[#EF4444]/10 text-[#EF4444]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-[#111111] font-medium">Arrastra tu archivo aquí</p>
              <p className="text-sm text-[#6B7280] mt-1">o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {/* Parse result */}
        <AnimatePresence>
          {parseResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 space-y-3"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Preguntas", value: parseResult.questions.length, color: "text-[#5B8FCB]" },
                  { label: "Partidos", value: parseResult.parties.length, color: "text-[#5B8FCB]" },
                  { label: "Respuestas", value: parseResult.answers.length, color: "text-[#5B8FCB]" },
                  {
                    label: "Errores",
                    value: parseErrors.length,
                    color: parseErrors.length > 0 ? "text-[#EF4444]" : "text-green-500",
                  },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-[#F5F7FA] text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Detected sheets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#6B7280]">Hojas detectadas:</span>
                {parseResult.detectedSheets.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-mono bg-[#5B8FCB]/10 text-[#5B8FCB] px-2 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Errors */}
              {parseErrors.length > 0 && (
                <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-4 space-y-1 max-h-40 overflow-y-auto">
                  {parseErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#EF4444]">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        [{err.sheet}] Fila {err.row}, col &quot;{err.column}&quot;: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview: questions */}
              {parseResult.questions.length > 0 && (
                <div className="rounded-xl border border-[#6B7280]/10 overflow-hidden">
                  <div className="px-3 py-2 bg-[#F5F7FA] border-b border-[#6B7280]/10">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                      Vista previa — preguntas
                    </p>
                  </div>
                  <div className="overflow-x-auto max-h-44">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F5F7FA]">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">ID</th>
                          <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">Pregunta</th>
                          <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">Categoría</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#6B7280]/10">
                        {parseResult.questions.slice(0, 6).map((row, i) => (
                          <tr key={i} className="hover:bg-[#F5F7FA]/50">
                            <td className="py-2 px-3 text-[#6B7280] font-mono">{row.externalId}</td>
                            <td className="py-2 px-3 text-[#111111] max-w-xs truncate">{row.text}</td>
                            <td className="py-2 px-3 text-[#6B7280]">{row.category}</td>
                          </tr>
                        ))}
                        {parseResult.questions.length > 6 && (
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-center text-sm text-[#6B7280]">
                              +{parseResult.questions.length - 6} preguntas más…
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Preview: parties */}
              {parseResult.parties.length > 0 && (
                <div className="rounded-xl border border-[#6B7280]/10 p-3">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                    Vista previa — partidos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parseResult.parties.map((p, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#5B8FCB]/10 text-[#5B8FCB] px-2 py-1 rounded-lg font-medium"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Import button */}
              <button
                onClick={handleImport}
                disabled={
                  importing ||
                  (parseResult.questions.length === 0 && parseResult.parties.length === 0)
                }
                className="w-full py-3 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importando…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar {parseResult.questions.length} preguntas +{" "}
                    {parseResult.parties.length} partidos a Firestore
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export */}
      <div className="bg-white rounded-2xl border border-[#6B7280]/10 p-6">
        <h3 className="text-lg font-bold text-[#111111] mb-1">Exportar datos</h3>
        <p className="text-sm text-[#6B7280] mb-6">
          Descarga los datos de Firestore en formato CSV.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {exportItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleExport(item.id)}
              disabled={exporting === item.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#6B7280]/10 hover:border-[#5B8FCB]/30 hover:bg-[#F5F7FA] text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {exporting === item.id ? (
                <div className="w-9 h-9 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#5B8FCB] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#5B8FCB]/10 text-[#5B8FCB] flex items-center justify-center group-hover:bg-[#5B8FCB] group-hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="font-semibold text-[#111111] text-sm">{item.label}</p>
                <p className="text-xs text-[#6B7280]">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
