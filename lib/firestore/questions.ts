import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Question } from "@/lib/types"

export async function getQuestions(): Promise<Question[]> {
  const q = query(collection(db, "questions"), orderBy("order"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      docId: d.id,
      externalId: String(data.externalId ?? ""),
      text: String(data.text ?? ""),
      category: String(data.category ?? ""),
      code: String(data.code ?? ""),
      notes: String(data.notes ?? ""),
      order: Number(data.order ?? 0),
      active: Boolean(data.active ?? true),
    }
  })
}

export async function addQuestion(q: Omit<Question, "docId">): Promise<string> {
  const docRef = await addDoc(collection(db, "questions"), {
    ...q,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function deleteQuestion(docId: string): Promise<void> {
  await deleteDoc(doc(db, "questions", docId))
}

export async function importQuestions(rows: Omit<Question, "docId">[]): Promise<void> {
  // Pre-fetch existing docs to enable upsert by externalId
  const existing = await getQuestions()
  // Filter out docs with empty externalId to avoid false collisions
  const existingMap = new Map(
    existing
      .filter((q) => q.externalId.trim() !== "")
      .map((q) => [q.externalId, q.docId]),
  )

  const BATCH_SIZE = 400
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    rows.slice(i, i + BATCH_SIZE).forEach((row) => {
      // Only attempt upsert lookup when externalId is non-empty
      const existingDocId = row.externalId ? existingMap.get(row.externalId) : undefined
      const ref = existingDocId
        ? doc(db, "questions", existingDocId)
        : doc(collection(db, "questions"))
      batch.set(
        ref,
        {
          ...row,
          ...(existingDocId ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    })
    await batch.commit()
  }
}
