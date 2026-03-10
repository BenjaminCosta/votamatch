import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { MatchResult } from "@/lib/types"

export interface ResponsePayload {
  answers: Record<number, { answer: "yes" | "no" | "neutral"; important: boolean }>
  results: MatchResult[]
}

export async function saveResponse(payload: ResponsePayload): Promise<string> {
  const docRef = await addDoc(collection(db, "responses"), {
    answers: payload.answers,
    results: payload.results,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export interface ResponseDoc {
  docId: string
  results: MatchResult[]
  answersCount: number
  createdAt: Date | null
}

export async function getResponses(limitCount = 500): Promise<ResponseDoc[]> {
  const q = query(
    collection(db, "responses"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      docId: d.id,
      results: (data.results ?? []) as MatchResult[],
      answersCount: Object.keys(data.answers ?? {}).length,
      createdAt: data.createdAt?.toDate() ?? null,
    }
  })
}
