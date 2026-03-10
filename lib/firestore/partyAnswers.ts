import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { PartyAnswer } from "@/lib/types"

export async function getPartyAnswers(): Promise<PartyAnswer[]> {
  const snap = await getDocs(collection(db, "partyAnswers"))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      docId: d.id,
      partyId: String(data.partyId ?? ""),
      questionExternalId: String(data.questionExternalId ?? ""),
      answer: (data.answer ?? "neutral") as "yes" | "no" | "neutral",
    }
  })
}

export async function addPartyAnswer(pa: Omit<PartyAnswer, "docId">): Promise<void> {
  await addDoc(collection(db, "partyAnswers"), {
    ...pa,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePartyAnswer(docId: string): Promise<void> {
  await deleteDoc(doc(db, "partyAnswers", docId))
}

export async function importPartyAnswers(rows: Omit<PartyAnswer, "docId">[]): Promise<void> {
  // Pre-fetch existing IDs so we only set createdAt for genuinely new docs
  // (merge: true would otherwise overwrite an existing createdAt)
  const existingSnap = await getDocs(collection(db, "partyAnswers"))
  const existingIds = new Set(existingSnap.docs.map((d) => d.id))

  const BATCH_SIZE = 400
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    rows.slice(i, i + BATCH_SIZE).forEach((row) => {
      // Deterministic docId = "partyId_questionExternalId" → natural upsert, no duplicates
      const deterministicId = `${row.partyId}_${row.questionExternalId}`
      const ref = doc(db, "partyAnswers", deterministicId)
      const isNew = !existingIds.has(deterministicId)
      batch.set(
        ref,
        {
          ...row,
          ...(isNew ? { createdAt: serverTimestamp() } : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    })
    await batch.commit()
  }
}

// ─── Aggregated read for quiz ──────────────────────────────────────────────

export interface PartyForQuiz {
  docId: string
  name: string
  answers: Record<string, "yes" | "no" | "neutral">
}

export async function getPartiesForQuiz(): Promise<PartyForQuiz[]> {
  const [partiesSnap, answersSnap] = await Promise.all([
    getDocs(collection(db, "parties")),
    getDocs(collection(db, "partyAnswers")),
  ])

  const answerMap = new Map<string, Record<string, "yes" | "no" | "neutral">>()
  answersSnap.docs.forEach((d) => {
    const data = d.data()
    const partyId = String(data.partyId ?? "")
    const qExtId = String(data.questionExternalId ?? "")
    const answer = (data.answer ?? "neutral") as "yes" | "no" | "neutral"
    if (!answerMap.has(partyId)) answerMap.set(partyId, {})
    answerMap.get(partyId)![qExtId] = answer
  })

  return partiesSnap.docs.map((d) => ({
    docId: d.id,
    name: String(d.data().name ?? ""),
    answers: answerMap.get(d.id) ?? {},
  }))
}
