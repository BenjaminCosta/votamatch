import * as XLSX from "xlsx"
import type { Question, Party, PartyAnswer } from "@/lib/types"
import type { ResponseDoc } from "@/lib/firestore/responses"
import { nameToSlug } from "@/lib/firestore/parties"

// ─── Answer normalisation ──────────────────────────────────────────────────

const YES_VALUES = ["sí", "si", "sí.", "si.", "yes"]
const NO_VALUES = ["no", "no."]
const NEUTRAL_VALUES = ["neutral", "neutro", "n", "n/a", "–", "-", ""]

export function normalizeAnswer(raw: unknown): "yes" | "no" | "neutral" | null {
  if (raw === undefined || raw === null) return "neutral"
  const val = String(raw).trim().toLowerCase()
  if (YES_VALUES.includes(val)) return "yes"
  if (NO_VALUES.includes(val)) return "no"
  if (NEUTRAL_VALUES.includes(val)) return "neutral"
  return null // invalid
}

function normalizeNumericAnswer(raw: unknown): "yes" | "no" | "neutral" | null {
  if (raw === undefined || raw === null || raw === "") return "neutral"
  const n = Number(raw)
  if (n === 1) return "yes"
  if (n === 0) return "neutral"
  if (n === -1) return "no"
  const s = String(raw).trim().toLowerCase()
  if (s === "yes" || s === "sí" || s === "si") return "yes"
  if (s === "neutral" || s === "") return "neutral"
  if (s === "no") return "no"
  return null
}

// ─── Parse result types ────────────────────────────────────────────────────

export interface ParsedQuestion {
  externalId: string
  text: string
  category: string
  code: string
  notes: string
  order: number
  active: true
}

export interface ParseRowError {
  sheet: string
  row: number
  column: string
  value: unknown
  message: string
}

export interface ParsedParty {
  name: string
  slug: string
  color: null
  active: true
}

export interface ParsedAnswer {
  partyName: string
  questionExternalId: string
  answer: "yes" | "no" | "neutral"
}

export interface ParseResult {
  detectedSheets: string[]
  questions: ParsedQuestion[]
  parties: ParsedParty[]
  answers: ParsedAnswer[]
  errors: ParseRowError[]
}

// ─── File parsing ──────────────────────────────────────────────────────────

const REQUIRED_SHEETS = ["preguntas", "partidos_respuestas"]
const QUESTION_COL_RE = /^P\d+$/i

export async function parseFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })

  const normalizedNames = wb.SheetNames.map((s) => s.toLowerCase().trim())
  const detectedSheets = wb.SheetNames

  const missing = REQUIRED_SHEETS.filter((s) => !normalizedNames.includes(s))
  if (missing.length > 0) {
    throw new Error(
      `Hojas requeridas no encontradas: ${missing.join(", ")}. Hojas en el archivo: ${wb.SheetNames.join(", ")}`,
    )
  }

  const findSheet = (name: string) => {
    const idx = normalizedNames.indexOf(name)
    return wb.Sheets[wb.SheetNames[idx]]
  }

  const errors: ParseRowError[] = []

  // ── Questions (sheet: preguntas) ─────────────────────────────────────────
  const rawQuestions: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
    findSheet("preguntas"),
    { defval: "", raw: false },
  )

  const questions: ParsedQuestion[] = []
  rawQuestions.forEach((row, idx) => {
    const rowNum = idx + 2
    const externalId = String(row["ID"] ?? row["id"] ?? "").trim()
    const text = String(row["Pregunta"] ?? row["pregunta"] ?? "").trim()
    const category = String(
      row["Categoria"] ?? row["Categoría"] ?? row["categoria"] ?? "",
    ).trim()
    const code = String(
      row["Codificación"] ?? row["Codificacion"] ?? row["code"] ?? "",
    ).trim()
    const notes = String(row["Notas"] ?? row["notas"] ?? "").trim()

    if (!externalId && !text) return // skip empty rows

    if (!externalId)
      errors.push({ sheet: "preguntas", row: rowNum, column: "ID", value: row["ID"], message: "ID requerido" })
    if (!text)
      errors.push({ sheet: "preguntas", row: rowNum, column: "Pregunta", value: row["Pregunta"], message: "Pregunta requerida" })
    if (!category)
      errors.push({ sheet: "preguntas", row: rowNum, column: "Categoria", value: row["Categoria"], message: "Categoría requerida" })

    if (externalId && text && category) {
      questions.push({ externalId, text, category, code, notes, order: idx, active: true })
    }
  })

  // ── Parties + Answers (sheet: partidos_respuestas) ────────────────────────
  const rawAnswers: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
    findSheet("partidos_respuestas"),
    { defval: "", raw: true },
  )

  const parties: ParsedParty[] = []
  const answers: ParsedAnswer[] = []
  const seenPartySlugs = new Set<string>()

  rawAnswers.forEach((row, idx) => {
    const rowNum = idx + 2
    const partyName = String(
      row["Partido"] ?? row["partido"] ?? row["PARTIDO"] ?? "",
    ).trim()

    if (!partyName) return // skip empty rows

    // Deduplicate parties — same slug = same party appearing in multiple rows
    const partySlug = nameToSlug(partyName)
    if (!seenPartySlugs.has(partySlug)) {
      seenPartySlugs.add(partySlug)
      parties.push({ name: partyName, slug: partySlug, color: null, active: true })
    }

    Object.entries(row).forEach(([col, val]) => {
      if (!QUESTION_COL_RE.test(col)) return
      const questionExternalId = col.toUpperCase()
      const normalized = normalizeNumericAnswer(val)

      if (normalized === null) {
        if (String(val).trim() !== "") {
          errors.push({
            sheet: "partidos_respuestas",
            row: rowNum,
            column: col,
            value: val,
            message: `Valor inválido "${val}" (esperado 1, 0 o -1)`,
          })
        }
        return
      }

      answers.push({ partyName, questionExternalId, answer: normalized })
    })
  })

  return { detectedSheets, questions, parties, answers, errors }
}

// ─── CSV export helpers ────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], data: (string | number | boolean | null)[][]) {
  const csv = [
    headers.join(","),
    ...data.map((r) =>
      r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportQuestions(questions: Question[]): void {
  const headers = ["ID", "Pregunta", "Categoria", "Codificacion", "Notas", "Orden", "Activa"]
  const data: (string | number | boolean | null)[][] = questions.map((q) => [
    q.externalId, q.text, q.category, q.code, q.notes, q.order, q.active,
  ])
  downloadCSV(`preguntas_${new Date().toISOString().slice(0, 10)}.csv`, headers, data)
}

export function exportParties(parties: Party[]): void {
  const headers = ["Nombre", "Slug", "Color", "Activo"]
  const data: (string | number | boolean | null)[][] = parties.map((p) => [
    p.name, p.slug, p.color ?? "", p.active,
  ])
  downloadCSV(`partidos_${new Date().toISOString().slice(0, 10)}.csv`, headers, data)
}

export function exportPartyAnswers(
  answers: PartyAnswer[],
  parties: Party[],
  questions: Question[],
): void {
  const partyMap = new Map(parties.map((p) => [p.docId, p.name]))
  const qMap = new Map(questions.map((q) => [q.externalId, q.text]))
  const headers = ["Partido", "ID Pregunta", "Pregunta", "Respuesta"]
  const data: (string | number | boolean | null)[][] = answers.map((a) => [
    partyMap.get(a.partyId) ?? a.partyId,
    a.questionExternalId,
    qMap.get(a.questionExternalId) ?? "",
    a.answer,
  ])
  downloadCSV(`respuestas_partidos_${new Date().toISOString().slice(0, 10)}.csv`, headers, data)
}

export function exportResponses(responses: ResponseDoc[]): void {
  const headers = ["Fecha", "Respuestas", "Primer partido", "% Match"]
  const data: (string | number | boolean | null)[][] = responses.map((r) => [
    r.createdAt ? r.createdAt.toLocaleDateString("es-PE") : "",
    r.answersCount,
    r.results[0]?.partyName ?? "",
    r.results[0]?.percentage ?? "",
  ])
  downloadCSV(`participaciones_${new Date().toISOString().slice(0, 10)}.csv`, headers, data)
}
