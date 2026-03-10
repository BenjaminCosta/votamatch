import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Party } from "@/lib/types"

export async function getParties(): Promise<Party[]> {
  const snap = await getDocs(collection(db, "parties"))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      docId: d.id,
      name: String(data.name ?? ""),
      slug: String(data.slug ?? ""),
      color: data.color ? String(data.color) : null,
      iconUrl: data.iconUrl ? String(data.iconUrl) : null,
      iconFileName: data.iconFileName ? String(data.iconFileName) : null,
      active: Boolean(data.active ?? true),
    }
  })
}

export async function addParty(p: Omit<Party, "docId">): Promise<string> {
  const docRef = await addDoc(collection(db, "parties"), {
    ...p,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function deleteParty(docId: string): Promise<void> {
  await deleteDoc(doc(db, "parties", docId))
}

export async function updateParty(
  docId: string,
  data: Partial<Omit<Party, "docId">>,
): Promise<void> {
  await updateDoc(doc(db, "parties", docId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function importParties(rows: Omit<Party, "docId">[]): Promise<Map<string, string>> {
  // Validate: reject input that contains duplicate slugs/names up-front
  // (Firestore cannot roll back already-committed batches, so we fail fast)
  const inputSlugs = rows.map((r) => r.slug)
  const duplicateSlugs = inputSlugs.filter((s, i) => inputSlugs.indexOf(s) !== i)
  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Partidos con nombre duplicado en el archivo: ${[...new Set(duplicateSlugs)].join(", ")}`,
    )
  }

  // Pre-fetch existing to enable upsert by slug
  const existing = await getParties()
  const existingMap = new Map(existing.map((p) => [p.slug, p.docId]))
  const nameToDocId = new Map<string, string>()

  const BATCH_SIZE = 400
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    rows.slice(i, i + BATCH_SIZE).forEach((row) => {
      const existingDocId = existingMap.get(row.slug)
      const ref = existingDocId
        ? doc(db, "parties", existingDocId)
        : doc(collection(db, "parties"))
      batch.set(
        ref,
        {
          ...row,
          ...(existingDocId ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      nameToDocId.set(row.name, existingDocId ?? ref.id)
    })
    await batch.commit()
  }

  return nameToDocId
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
