import type { MatchResult } from "@/lib/types"

const SESSION_KEY = "votamatch_results"

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
