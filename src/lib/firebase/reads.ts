import { getDoc, type DocumentData, type DocumentReference } from "firebase/firestore";

export function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "permission-denied"
  );
}

/**
 * Reads a document whose security rules only allow participants to read it.
 *
 * For non-existent documents those rules evaluate against `null` and deny the
 * read, which surfaces as `permission-denied` instead of "not found". In that
 * case the caller cares about "does not exist", so we normalize it to `null`.
 */
export async function getDocIfAllowed<T = DocumentData>(
  reference: DocumentReference<T>
) {
  try {
    return await getDoc(reference);
  } catch (error) {
    if (isPermissionDenied(error)) return null;
    throw error;
  }
}
