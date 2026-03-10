import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { type SiteTexts, DEFAULT_SITE_TEXTS } from "@/lib/types"

const getSiteTextsRef = () => doc(db, "siteTexts", "config")

export async function getSiteTexts(): Promise<SiteTexts> {
  const snap = await getDoc(getSiteTextsRef())
  if (!snap.exists()) return { ...DEFAULT_SITE_TEXTS }
  const data = snap.data()
  return {
    introTitle: String(data.introTitle ?? DEFAULT_SITE_TEXTS.introTitle),
    introText: String(data.introText ?? DEFAULT_SITE_TEXTS.introText),
    introDisclaimer: String(data.introDisclaimer ?? DEFAULT_SITE_TEXTS.introDisclaimer),
    resultDisclaimer: String(data.resultDisclaimer ?? DEFAULT_SITE_TEXTS.resultDisclaimer),
    contactEmail: String(data.contactEmail ?? DEFAULT_SITE_TEXTS.contactEmail),
  }
}

export async function saveSiteTexts(texts: SiteTexts): Promise<void> {
  await setDoc(getSiteTextsRef(), { ...texts, updatedAt: serverTimestamp() }, { merge: true })
}
