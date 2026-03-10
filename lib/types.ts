// ─── Core domain types ─────────────────────────────────────────────────────
export type AnswerValue = "yes" | "no" | "neutral"
export interface Question {
  docId: string
  externalId: string
  text: string
  category: string
  code: string
  notes: string
  order: number
  active: boolean
}

export interface Party {
  docId: string
  name: string
  slug: string
  color: string | null
  iconUrl: string | null
  iconFileName: string | null
  active: boolean
}

export interface PartyAnswer {
  docId: string
  partyId: string
  questionExternalId: string
  answer: AnswerValue
}

export interface SiteTexts {
  introTitle: string
  introText: string
  introDisclaimer: string
  resultDisclaimer: string
  contactEmail: string
}

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  introTitle: "Descubre con qué partido coincides",
  introText:
    "Responde preguntas sobre los temas más importantes del país y descubre qué partido representa mejor tus ideas.",
  introDisclaimer: "Tus respuestas son completamente anónimas.",
  resultDisclaimer:
    "Estos resultados son orientativos y se basan en las posiciones públicas de los partidos.",
  contactEmail: "",
}

// ─── Quiz types ────────────────────────────────────────────────────────────

export interface UserAnswer {
  questionExternalId: string
  answer: AnswerValue
  important: boolean
}

export interface MatchResult {
  partyId: string
  partyName: string
  /** Slug used to resolve the party logo from /public/parties/ */
  partySlug: string
  partyIconFileName: string | null
  percentage: number
}
