/**
 * Official party colors keyed by their Firestore slug.
 * Used as the authoritative source for the color accent in cards and
 * progress bars throughout the admin and result pages.
 *
 * getPartyColor(slug, fallback?) → hex string
 */

const PARTY_COLOR_MAP: Record<string, string> = {
  // ── By primary slug ────────────────────────────────────────────────────
  "ahora-nacion-an": "#E11D48",
  "alianza-electoral-venceremos": "#DC2626",
  "alianza-para-el-progreso": "#2563EB",
  "avanza-pais-partido-de-integracion-social": "#1D4ED8",
  "fe-en-el-peru": "#DC2626",
  "fuerza-popular": "#F97316",
  // Alianza Electoral Fuerza y Libertad (full name or short)
  "alianza-electoral-fuerza-y-libertad": "#DC2626",
  "fuerza-y-libertad": "#DC2626",
  "juntos-por-el-peru": "#E11D48",
  "libertad-popular": "#2563EB",
  "partido-aprista-peruano": "#DC2626",
  "partido-civico-obras": "#2563EB",
  "partido-de-los-trabajadores-y-emprendedores-pte-peru": "#DC2626",
  "partido-del-buen-gobierno": "#2563EB",
  "partido-democrata-unido-peru": "#2563EB",
  "partido-democrata-verde": "#16A34A",
  "partido-democratico-federal": "#2563EB",
  "partido-democratico-somos-peru": "#10B981",
  "partido-frente-de-la-esperanza-2021": "#2563EB",
  "partido-morado": "#7C3AED",
  "partido-pais-para-todos": "#2563EB",
  "partido-patriotico-del-peru": "#DC2626",
  "partido-politico-cooperacion-popular": "#2563EB",
  "partido-politico-integridad-democratica": "#2563EB",
  "partido-politico-nacional-peru-libre": "#DC2626",
  "partido-politico-peru-accion": "#2563EB",
  "partido-politico-peru-primero": "#2563EB",
  "partido-politico-prin": "#2563EB",
  "partido-sicreo": "#2563EB",
  "peru-moderno": "#2563EB",
  "podemos-peru": "#10B981",
  "progresemos": "#2563EB",
  "renovacion-popular": "#1D4ED8",
  "salvemos-al-peru": "#2563EB",
  "un-camino-diferente": "#2563EB",
  // Alianza Electoral Unidad Nacional (full name or short)
  "alianza-electoral-unidad-nacional": "#2563EB",
  "unidad-nacional": "#2563EB",
  "frente-popular-agricola-fia-del-peru": "#16A34A",
  "partido-ciudadanos-por-el-peru": "#2563EB",
  "primero-la-gente-comunidad-ecologia-libertad-y-progreso": "#16A34A",
}

/** Default fallback when no entry is found */
const DEFAULT_COLOR = "#6B7280"

/**
 * Returns the official color for a party given its slug.
 * Falls back to `firestoreColor` (the value stored in Firestore) if
 * the slug is not in the map, then to the hardcoded default.
 */
export function getPartyColor(slug: string, firestoreColor?: string | null): string {
  return PARTY_COLOR_MAP[slug] ?? firestoreColor ?? DEFAULT_COLOR
}

/** Hex color → subtle CSS rgba background (default 8% opacity) */
export function colorToAlpha(hex: string, alpha = 0.08): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
