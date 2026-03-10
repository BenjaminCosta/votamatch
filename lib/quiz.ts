// Re-export shared types from lib/types.ts
export type { Question, Party, UserAnswer, MatchResult, SiteTexts } from "@/lib/types"

/**
 * Calculates alignment between a user's answers and a party's positions.
 * - Full match (same non-neutral answer): 1 pt (2 if important)
 * - Partial match (either side neutral):  0.5 pt (1 if important)
 * - No match (opposite answers):          0 pt
 *
 * Uses externalId as the key for matching user answers to party positions.
 */
export function calculateMatch(
  userAnswers: { questionExternalId: string; answer: "yes" | "no" | "neutral"; important: boolean }[],
  partyAnswers: Record<string, "yes" | "no" | "neutral">
): number {
  let points = 0
  let maxPoints = 0

  for (const { questionExternalId, answer, important } of userAnswers) {
    const partyAnswer = partyAnswers[questionExternalId]
    if (!partyAnswer) continue

    const weight = important ? 2 : 1
    maxPoints += weight

    if (answer === partyAnswer) {
      points += weight
    } else if (answer === "neutral" || partyAnswer === "neutral") {
      points += weight * 0.5
    }
  }

  if (maxPoints === 0) return 0
  return Math.round((points / maxPoints) * 100)
}
