"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Penyimpanan progres simulasi + status login, dipakai semua simulasi.
 *
 * Yang dilakukan:
 * 1. Menyimpan progres ke localStorage setiap berubah, sehingga refresh tidak mengulang dari Level 1.
 * 2. Memulihkan progres saat halaman dibuka.
 * 3. Memindahkan progres tamu ke akun saat user login (progres tamu tidak hilang).
 * 4. Menyediakan status login untuk gerbang login di level tertentu.
 *
 * Aturan penyimpanan:
 * - Level yang sedang dimainkan dan sudah dimenangkan tetapi belum "Lanjut" tidak disimpan,
 *   jadi level itu diulang dari awal. Ini menjaga data tetap konsisten untuk validasi server.
 * - Percobaan gagal di level yang belum selesai tetap disimpan,
 *   jadi refresh tidak bisa dipakai untuk menghapus pengurangan XP.
 * - Percakapan/aksi yang sedang berjalan di tengah level tidak dipulihkan.
 */

/** Tamu diminta login setelah menyelesaikan level ini. */
export const LOGIN_GATE_AFTER_LEVEL = 5;

/** Sesuaikan dengan rute login aplikasimu. */
export const LOGIN_PATH = "/login";

/** Naikkan angka ini jika isi soal berubah besar, agar progres lama tidak dipulihkan. */
const STORAGE_VERSION = 1;

export function buildLoginHref() {
  if (typeof window === "undefined") return LOGIN_PATH;

  const here = `${window.location.pathname}${window.location.search}`;

  return `${LOGIN_PATH}?next=${encodeURIComponent(here)}`;
}

export type LearningSession = {
  ready: boolean;
  authenticated: boolean;
  userId: string | null;
  completed: boolean;
};

export type ProgressSnapshot = {
  currentIndex: number;
  completedIds: string[];
  safeIds?: string[];
  /** choices: Record<levelId, string[]>, dialogue: Record<levelId, string[][]> */
  attempts: Record<string, unknown>;
  runSeed: number;
  finished?: boolean;
  rewardMessage?: string;
  declinedLogin?: boolean;
};

type AttemptsShape = "choices" | "dialogue";

type Options = {
  simulationId: string;
  scenarioIds: string[];
  attemptsShape: AttemptsShape;
  snapshot: ProgressSnapshot;
  /** true = jangan simpan/pulihkan (misalnya saat tutorial berjalan). */
  paused: boolean;
  onRestore: (saved: ProgressSnapshot) => void;
};

/* ========================================
   FUNGSI BANTU
======================================== */

const storageKey = (simulationId: string, owner: string) =>
  `cekin:learning-progress:v${STORAGE_VERSION}:${simulationId}:${owner}`;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Bersihkan data dari localStorage agar aman dipakai (bisa saja rusak atau diubah manual). */
function sanitize(
  raw: unknown,
  scenarioIds: string[],
  shape: AttemptsShape,
): ProgressSnapshot | null {
  if (typeof raw !== "object" || raw === null || scenarioIds.length === 0) {
    return null;
  }

  const record = raw as Record<string, unknown>;

  let completedIds = isStringArray(record.completedIds)
    ? record.completedIds.filter((id) => scenarioIds.includes(id))
    : [];

  const attemptsRaw =
    typeof record.attempts === "object" &&
    record.attempts !== null &&
    !Array.isArray(record.attempts)
      ? (record.attempts as Record<string, unknown>)
      : {};

  const attempts: Record<string, unknown> = {};

  for (const id of scenarioIds) {
    const value = attemptsRaw[id];
    if (value === undefined) continue;

    const valid =
      shape === "choices"
        ? isStringArray(value)
        : Array.isArray(value) && value.every(isStringArray);

    if (valid) attempts[id] = value;
  }

  const finished =
    record.finished === true && completedIds.length === scenarioIds.length;

  // Semua level selesai tetapi belum diklaim: ulangi level terakhir.
  if (!finished && completedIds.length === scenarioIds.length) {
    const lastId = scenarioIds[scenarioIds.length - 1];
    completedIds = completedIds.filter((id) => id !== lastId);
    delete attempts[lastId];
  }

  let currentIndex =
    typeof record.currentIndex === "number" && Number.isInteger(record.currentIndex)
      ? record.currentIndex
      : 0;

  currentIndex = Math.min(Math.max(currentIndex, 0), scenarioIds.length - 1);

  // Level berurutan: tidak boleh melewati level pertama yang belum selesai.
  if (!finished) {
    const firstOpen = scenarioIds.findIndex((id) => !completedIds.includes(id));
    currentIndex = Math.min(currentIndex, firstOpen === -1 ? 0 : firstOpen);
  }

  return {
    currentIndex,
    completedIds,
    safeIds: isStringArray(record.safeIds)
      ? record.safeIds.filter((id) => completedIds.includes(id))
      : [],
    attempts,
    runSeed:
      typeof record.runSeed === "number" && Number.isFinite(record.runSeed)
        ? record.runSeed
        : 0,
    finished,
    rewardMessage:
      typeof record.rewardMessage === "string" ? record.rewardMessage : "",
    declinedLogin: record.declinedLogin === true,
  };
}

/** Buang level yang sedang dimainkan jika sudah dimenangkan tetapi belum "Lanjut". */
function trimForSave(
  snapshot: ProgressSnapshot,
  scenarioIds: string[],
): ProgressSnapshot {
  if (snapshot.finished) return snapshot;

  const currentId = scenarioIds[snapshot.currentIndex];
  if (!currentId || !snapshot.completedIds.includes(currentId)) return snapshot;

  const attempts = { ...snapshot.attempts };
  delete attempts[currentId];

  return {
    ...snapshot,
    completedIds: snapshot.completedIds.filter((id) => id !== currentId),
    safeIds: snapshot.safeIds?.filter((id) => id !== currentId),
    attempts,
  };
}

/** Mengembalikan teks JSON untuk disimpan, atau null jika tidak ada progres (hapus entri). */
function serialize(snapshot: ProgressSnapshot, scenarioIds: string[]) {
  const trimmed = trimForSave(snapshot, scenarioIds);

  const empty =
    !trimmed.finished &&
    trimmed.completedIds.length === 0 &&
    Object.keys(trimmed.attempts).length === 0;

  return empty ? null : JSON.stringify(trimmed);
}

function readSaved(
  key: string,
  scenarioIds: string[],
  shape: AttemptsShape,
): ProgressSnapshot | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    return sanitize(JSON.parse(raw), scenarioIds, shape);
  } catch {
    return null;
  }
}

function writeRaw(key: string, payload: string | null) {
  try {
    if (payload === null) localStorage.removeItem(key);
    else localStorage.setItem(key, payload);
  } catch {
    // Penyimpanan penuh atau diblokir: abaikan, simulasi tetap berjalan.
  }
}

const progressScore = (snapshot: ProgressSnapshot) =>
  snapshot.completedIds.length + (snapshot.finished ? 100 : 0);

/* ========================================
   HOOK
======================================== */

export function useLearningProgress({
  simulationId,
  scenarioIds,
  attemptsShape,
  snapshot,
  paused,
  onRestore,
}: Options) {
  const [session, setSession] = useState<LearningSession>({
    ready: false,
    authenticated: false,
    userId: null,
    completed: false,
  });
  const [restored, setRestored] = useState(false);
  const [resumed, setResumed] = useState(false);

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const idsRef = useRef(scenarioIds);
  idsRef.current = scenarioIds;

  // Pemilik penyimpanan saat ini: id user, atau "guest".
  const ownerRef = useRef<string | null>(null);
  const lastWritten = useRef("");

  // 1. Status login (diperbarui lagi saat ada perubahan auth).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let next: LearningSession = {
        ready: true,
        authenticated: false,
        userId: null,
        completed: false,
      };

      try {
        const response = await fetch(
          `/api/learning-protection/progress?simulationId=${simulationId}`,
          { credentials: "same-origin", cache: "no-store" },
        );

        if (response.ok) {
          const data = await response.json();
          const authenticated = Boolean(data.authenticated);

          next = {
            ready: true,
            authenticated,
            userId: authenticated && data.userId ? String(data.userId) : null,
            completed: Boolean(data.completed),
          };
        }
      } catch {
        // Gagal cek status: perlakukan sebagai tamu.
      }

      if (!cancelled) setSession(next);
    };

    void load();

    const onAuthChange = () => {
      void load();
    };

    window.addEventListener("cekin-auth-change", onAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener("cekin-auth-change", onAuthChange);
    };
  }, [simulationId]);

  // 2. Pulihkan progres (sekali) dan pindahkan progres tamu ke akun.
  useEffect(() => {
    if (!session.ready) return;

    const owner = session.userId ?? "guest";
    const ids = idsRef.current;

    if (ownerRef.current === null) {
      ownerRef.current = owner;

      const ownKey = storageKey(simulationId, owner);
      let saved = readSaved(ownKey, ids, attemptsShape);

      if (owner !== "guest") {
        const guestKey = storageKey(simulationId, "guest");
        const guest = readSaved(guestKey, ids, attemptsShape);

        if (guest) {
          if (!saved || progressScore(guest) > progressScore(saved)) {
            saved = guest;
            writeRaw(ownKey, serialize(guest, ids));
          }

          writeRaw(guestKey, null);
        }
      }

      const current = snapshotRef.current;
      const pristine =
        current.currentIndex === 0 &&
        current.completedIds.length === 0 &&
        Object.keys(current.attempts).length === 0 &&
        !current.finished;

      if (saved && pristine && !pausedRef.current) {
        onRestoreRef.current(saved);
        setResumed(true);
      }

      setRestored(true);
      return;
    }

    // User login/berganti akun tanpa reload: pindahkan progres yang sedang berjalan.
    if (ownerRef.current !== owner) {
      const previousOwner = ownerRef.current;
      ownerRef.current = owner;

      if (previousOwner === "guest" && owner !== "guest") {
        writeRaw(
          storageKey(simulationId, owner),
          serialize(snapshotRef.current, ids),
        );
        writeRaw(storageKey(simulationId, "guest"), null);
      }
    }
  }, [session, simulationId, attemptsShape]);

  // 3. Simpan setiap kali progres berubah (hanya menulis jika isinya berbeda).
  useEffect(() => {
    if (!restored || paused) return;

    const key = storageKey(simulationId, ownerRef.current ?? "guest");
    const payload = serialize(snapshot, idsRef.current);
    const signature = `${key}|${payload ?? ""}`;

    if (signature === lastWritten.current) return;

    lastWritten.current = signature;
    writeRaw(key, payload);
  });

  /** Simpan sekarang juga, misalnya sebelum pindah ke halaman login. */
  const flush = useCallback(
    (override?: ProgressSnapshot) => {
      const key = storageKey(simulationId, ownerRef.current ?? "guest");
      const payload = serialize(override ?? snapshotRef.current, idsRef.current);

      writeRaw(key, payload);
      lastWritten.current = `${key}|${payload ?? ""}`;
    },
    [simulationId],
  );

  return { session, restored, resumed, flush };
}