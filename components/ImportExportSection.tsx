"use client"

import { useState, useRef, useCallback } from "react"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  FileSpreadsheet,
  Building2,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportExportSectionProps {
  onToast: (message: string, type: "success" | "error" | "info") => void
}

type ExportType = "preguntas" | "partidos" | "respuestas" | "resultados"

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]

const MOCK_PREVIEW = {
  headers: ["#", "Pregunta", "Categoría"],
  rows: [
    ["1", "¿Deberían aumentarse los impuestos a las grandes empresas?", "Economía"],
    ["2", "¿Está de acuerdo con legalizar el uso recreativo de la marihuana?", "Social"],
    ["3", "¿Debería el Estado invertir más en educación pública?", "Educación"],
    ["4", "¿Apoya la construcción de más cárceles para reducir la delincuencia?", "Seguridad"],
    ["5", "¿Cree que debería permitirse el matrimonio entre personas del mismo sexo?", "Social"],
  ],
}

const CATEGORY_STYLES: Record<string, string> = {
  Economía: "bg-[#5B8FCB]/10 text-[#5B8FCB]",
  Social: "bg-[#EF4444]/10 text-[#EF4444]",
  Educación: "bg-[#5B8FCB]/10 text-[#5B8FCB]",
  Seguridad: "bg-[#6B7280]/10 text-[#6B7280]",
}

const EXPORT_ITEMS: {
  type: ExportType
  label: string
  icon: React.ElementType
  count: string
}[] = [
  { type: "preguntas", label: "Exportar preguntas", icon: FileText, count: "33 registros" },
  { type: "partidos", label: "Exportar partidos", icon: Building2, count: "8 partidos" },
  { type: "respuestas", label: "Exportar respuestas", icon: MessageSquare, count: "264 registros" },
  { type: "resultados", label: "Exportar resultados", icon: BarChart3, count: "Todos los resultados" },
]

const EXPORT_LABELS: Record<ExportType, string> = {
  preguntas: "Preguntas",
  partidos: "Partidos",
  respuestas: "Respuestas",
  resultados: "Resultados",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImportExportSection({ onToast }: ImportExportSectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [exportLoading, setExportLoading] = useState<ExportType | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File handling ──

  const validateAndSetFile = useCallback((f: File) => {
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "")
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError("Formato no permitido. Solo se aceptan archivos .csv y .xlsx")
      setFile(null)
      return
    }
    setFileError(null)
    setFile(f)
    setImportSuccess(false)
  }, [])

  const removeFile = () => {
    setFile(null)
    setFileError(null)
    setImportSuccess(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Drag & Drop ──

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) validateAndSetFile(dropped)
    },
    [validateAndSetFile],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) validateAndSetFile(selected)
  }

  // ── Import ──

  const handleImport = () => {
    if (!file || isImporting) return
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setImportSuccess(true)
      onToast(`Datos importados correctamente desde "${file.name}"`, "success")
    }, 2000)
  }

  // ── Export ──

  const handleExport = (type: ExportType) => {
    if (exportLoading) return
    setExportLoading(type)
    setTimeout(() => {
      setExportLoading(null)
      onToast(`${EXPORT_LABELS[type]} exportados correctamente`, "success")
    }, 1500)
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════════
          IMPORT SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#6B7280]/10 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-[#6B7280]/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B8FCB]/10 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-[#5B8FCB]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Importar datos</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Sube un archivo CSV o Excel para importar datos al sistema.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Drop Zone / File Info ── */}
          <AnimatePresence mode="wait">
            {!file ? (
              /* Drop Zone */
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer select-none border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center gap-4 transition-all duration-200 ${
                    isDragging
                      ? "border-[#5B8FCB] bg-[#5B8FCB]/5 scale-[1.01]"
                      : fileError
                      ? "border-[#EF4444] bg-[#EF4444]/5"
                      : "border-[#6B7280]/25 hover:border-[#5B8FCB]/50 hover:bg-[#5B8FCB]/3"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleInputChange}
                  />

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      fileError
                        ? "bg-[#EF4444]/10"
                        : isDragging
                        ? "bg-[#5B8FCB]/20"
                        : "bg-[#5B8FCB]/10"
                    }`}
                  >
                    {fileError ? (
                      <AlertCircle className="w-7 h-7 text-[#EF4444]" />
                    ) : (
                      <Upload className="w-7 h-7 text-[#5B8FCB]" />
                    )}
                  </div>

                  {/* Text */}
                  {fileError ? (
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-[#EF4444]">{fileError}</p>
                      <p className="text-sm text-[#6B7280]">Intenta con un archivo .csv o .xlsx</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-[#111111]">
                        {isDragging ? "Suelta tu archivo aquí" : "Arrastra tu archivo CSV o Excel aquí"}
                      </p>
                      <p className="text-sm text-[#6B7280]">o haz clic para seleccionar</p>
                      <p className="text-xs text-[#6B7280]/60 pt-1">Formatos permitidos: .csv, .xlsx</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* File Info */
              <motion.div
                key="fileinfo"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    importSuccess
                      ? "bg-[#5B8FCB]/5 border-[#5B8FCB]/25"
                      : "bg-[#F5F7FA] border-[#6B7280]/15"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      importSuccess
                        ? "bg-[#5B8FCB]/15"
                        : "bg-white border border-[#6B7280]/10 shadow-sm"
                    }`}
                  >
                    {importSuccess ? (
                      <CheckCircle className="w-5 h-5 text-[#5B8FCB]" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5 text-[#5B8FCB]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111111] text-sm truncate">{file.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {formatFileSize(file.size)}
                      {importSuccess && " · Importado correctamente ✓"}
                    </p>
                  </div>

                  <button
                    onClick={removeFile}
                    title="Eliminar archivo"
                    className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#6B7280] hover:text-[#EF4444] transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Preview Table ── */}
          <AnimatePresence>
            {file && !importSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[#111111]">Vista previa</h4>
                  <p className="text-xs text-[#6B7280]">
                    Verifica que los datos sean correctos antes de importar.
                  </p>
                </div>

                <div className="rounded-xl border border-[#6B7280]/15 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-100">
                      <thead className="bg-[#F5F7FA]">
                        <tr>
                          {MOCK_PREVIEW.headers.map((h) => (
                            <th
                              key={h}
                              className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#6B7280]/10">
                        {MOCK_PREVIEW.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-[#F5F7FA]/50 transition-colors">
                            {/* # */}
                            <td className="py-3 px-4 text-sm text-[#6B7280] font-medium w-10">
                              {row[0]}
                            </td>
                            {/* Question */}
                            <td className="py-3 px-4 text-sm text-[#111111] max-w-65">
                              <span className="line-clamp-1">{row[1]}</span>
                            </td>
                            {/* Category badge */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-lg ${
                                  CATEGORY_STYLES[row[2]] ?? "bg-[#6B7280]/10 text-[#6B7280]"
                                }`}
                              >
                                {row[2]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2.5 bg-[#F5F7FA]/60 border-t border-[#6B7280]/10">
                    <p className="text-xs text-[#6B7280]">
                      Mostrando 5 de 33 filas · Solo vista previa
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Import Actions ── */}
          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 pt-1"
              >
                {importSuccess ? (
                  <button
                    onClick={removeFile}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5F7FA] text-[#6B7280] font-medium border border-[#6B7280]/20 hover:bg-[#6B7280]/10 transition-all text-sm"
                  >
                    Importar otro archivo
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5B8FCB] text-white font-medium hover:bg-[#4A7DB8] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#5B8FCB]/20 text-sm"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Importar datos
                        </>
                      )}
                    </button>
                    <button
                      onClick={removeFile}
                      disabled={isImporting}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#6B7280] font-medium border border-[#6B7280]/20 hover:bg-[#F5F7FA] disabled:opacity-60 transition-all text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Empty state hint ── */}
          {!file && !fileError && (
            <div className="flex items-center gap-2 text-xs text-[#6B7280]/60">
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span>Ningún archivo seleccionado</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          EXPORT SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#6B7280]/10 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-[#6B7280]/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B8FCB]/10 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-[#5B8FCB]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Exportar datos</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Descarga los datos del sistema en formato CSV.
            </p>
          </div>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-3">
          {EXPORT_ITEMS.map(({ type, label, icon: Icon, count }) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              disabled={exportLoading !== null}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#6B7280]/15 hover:border-[#5B8FCB]/40 hover:bg-[#5B8FCB]/4 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group text-left"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#5B8FCB]/10 flex items-center justify-center shrink-0 group-hover:bg-[#5B8FCB]/20 transition-colors">
                {exportLoading === type ? (
                  <Loader2 className="w-5 h-5 text-[#5B8FCB] animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-[#5B8FCB]" />
                )}
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111111] text-sm">{label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{count}</p>
              </div>

              {/* Download arrow */}
              {exportLoading !== type && (
                <Download className="w-4 h-4 text-[#6B7280]/40 group-hover:text-[#5B8FCB] transition-colors shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
