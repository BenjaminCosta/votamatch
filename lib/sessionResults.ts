import type { MatchResult } from "@/lib/types"

const SESSION_KEY = "votamatch_results"
const DETAILED_KEY = "votamatch_detailed"

// ─── Detailed comparison data ─────────────────────────────────────────────

export interface DetailedQuizData {
  userAnswers: Array<{
    questionExternalId: string
    answer: "yes" | "no" | "neutral"
    important: boolean
  }>
  questions: Array<{
    externalId: string
    text: string
    category: string
    order: number
  }>
  parties: Array<{
    partyId: string
    partyName: string
    partySlug: string
    partyIconFileName: string | null
    answers: Record<string, "yes" | "no" | "neutral">
  }>
}

export function saveDetailedData(data: DetailedQuizData): void {
  try {
    sessionStorage.setItem(DETAILED_KEY, JSON.stringify(data))
  } catch (err) {
    console.error("[sessionResults] failed to save detailed:", err)
  }
}

export function readDetailedData(): DetailedQuizData | null {
  try {
    const raw = sessionStorage.getItem(DETAILED_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const obj = parsed as Record<string, unknown>
    if (
      !Array.isArray(obj.userAnswers) ||
      !Array.isArray(obj.questions) ||
      !Array.isArray(obj.parties)
    )
      return null
    return parsed as DetailedQuizData
  } catch {
    return null
  }
}

export function clearDetailedData(): void {
  try {
    sessionStorage.removeItem(DETAILED_KEY)
  } catch {
    // ignore
  }
}

export function saveSessionResults(results: MatchResult[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(results))
  } catch (err) {
    console.error("[sessionResults] failed to save:", err)
  }
}

export function readSessionResults(): MatchResult[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    // Basic shape validation
    const valid = (parsed as unknown[]).every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).partyName === "string" &&
        typeof (item as Record<string, unknown>).percentage === "number",
    )
    return valid ? (parsed as MatchResult[]) : null
  } catch {
    return null
  }
}

export function clearSessionResults(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
