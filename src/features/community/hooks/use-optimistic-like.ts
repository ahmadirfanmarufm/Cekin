"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LikeState } from "@/features/community/types";

type Options = {
  /** Keadaan awal dari server. */
  initial: LikeState;
  /** Mengirim status yang DIINGINKAN (idempoten) dan mengembalikan keadaan resmi dari server. */
  send: (liked: boolean) => Promise<LikeState>;
  onError: (error: unknown) => void;
};

/** Tampilan = keadaan terakhir yang dikonfirmasi server + niat terbaru pengguna. */
const project = (confirmed: LikeState, desired: boolean): LikeState => {
  if (confirmed.hasLiked === desired) return confirmed;
  return { total: Math.max(0, confirmed.total + (desired ? 1 : -1)), hasLiked: desired };
};

/**
 * Like yang selalu langsung responsif:
 * - Setiap klik langsung mengubah tampilan, tombol tidak pernah dikunci.
 * - Hanya satu request berjalan pada satu waktu; klik berikutnya digabung menjadi
 *   satu "status akhir" yang dikirim setelah request sebelumnya selesai.
 * - Like lalu unlike cepat-cepat tidak menghasilkan request sama sekali bila status akhirnya sama.
 * - Bila gagal, tampilan dikembalikan ke keadaan terakhir yang dikonfirmasi server.
 */
export function useOptimisticLike({ initial, send, onError }: Options) {
  const [likes, setLikes] = useState<LikeState>(initial);

  const confirmedRef = useRef<LikeState>(initial);
  const desiredRef = useRef<boolean>(initial.hasLiked);
  const syncingRef = useRef(false);

  const sendRef = useRef(send);
  const onErrorRef = useRef(onError);
  sendRef.current = send;
  onErrorRef.current = onError;

  // Ikuti data baru dari server (mis. feed di-refresh), tetapi jangan ganggu saat sedang sinkronisasi.
  useEffect(() => {
    if (syncingRef.current) return;
    confirmedRef.current = initial;
    desiredRef.current = initial.hasLiked;
    setLikes(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.total, initial.hasLiked]);

  const flush = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      while (desiredRef.current !== confirmedRef.current.hasLiked) {
        const target = desiredRef.current;
        const result = await sendRef.current(target);

        confirmedRef.current = result;

        // Server tidak menuruti permintaan? Ikuti server agar tidak berputar tanpa henti.
        if (result.hasLiked !== target && desiredRef.current === target) {
          desiredRef.current = result.hasLiked;
        }

        setLikes(project(result, desiredRef.current));
      }
    } catch (error) {
      desiredRef.current = confirmedRef.current.hasLiked;
      setLikes(confirmedRef.current);
      onErrorRef.current(error);
    } finally {
      syncingRef.current = false;
    }
  }, []);

  const toggle = useCallback(() => {
    desiredRef.current = !desiredRef.current;
    setLikes(project(confirmedRef.current, desiredRef.current));
    void flush();
  }, [flush]);

  return { likes, toggle };
}
