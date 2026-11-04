// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOptimisticLike } from "./use-optimistic-like";

function fakeServer(initial: { total: number; hasLiked: boolean }, delay = 50) {
  let state = { ...initial };
  const calls: boolean[] = [];
  const send = vi.fn(async (liked: boolean) => {
    calls.push(liked);
    await new Promise((r) => setTimeout(r, delay));
    if (liked !== state.hasLiked) state = { total: state.total + (liked ? 1 : -1), hasLiked: liked };
    return { ...state };
  });
  return { send, calls, get state() { return state; } };
}

const setup = (srv: ReturnType<typeof fakeServer>, onError = vi.fn()) =>
  renderHook(() => useOptimisticLike({ initial: { total: 3, hasLiked: false }, send: srv.send, onError }));

describe("useOptimisticLike", () => {
  it("like lalu unlike saat request masih berjalan: tampilan berubah SEKETIKA, tidak perlu menunggu", async () => {
    const srv = fakeServer({ total: 3, hasLiked: false });
    const { result } = setup(srv);

    act(() => result.current.toggle());
    expect(result.current.likes).toEqual({ total: 4, hasLiked: true }); // langsung

    act(() => result.current.toggle()); // request pertama BELUM selesai
    expect(result.current.likes).toEqual({ total: 3, hasLiked: false }); // langsung unlike

    await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
    expect(result.current.likes).toEqual({ total: 3, hasLiked: false });
    expect(srv.state).toEqual({ total: 3, hasLiked: false }); // server akhirnya konsisten
  });

  it("klik cepat 7x: tampilan ikut tiap klik, server berakhir di status terakhir, request sedikit", async () => {
    const srv = fakeServer({ total: 3, hasLiked: false });
    const { result } = setup(srv);

    for (let i = 0; i < 7; i++) act(() => result.current.toggle());
    expect(result.current.likes).toEqual({ total: 4, hasLiked: true }); // 7 klik = ganjil = like

    await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
    expect(srv.state).toEqual({ total: 4, hasLiked: true });
    expect(result.current.likes).toEqual({ total: 4, hasLiked: true });
    expect(srv.calls.length).toBeLessThanOrEqual(3); // bukan 7
  });

  it("unlike lalu like lagi saat request berjalan juga langsung responsif", async () => {
    const srv = fakeServer({ total: 3, hasLiked: true });
    const { result } = renderHook(() =>
      useOptimisticLike({ initial: { total: 3, hasLiked: true }, send: srv.send, onError: vi.fn() }));

    act(() => result.current.toggle());
    expect(result.current.likes).toEqual({ total: 2, hasLiked: false });
    act(() => result.current.toggle());
    expect(result.current.likes).toEqual({ total: 3, hasLiked: true });

    await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
    expect(srv.state).toEqual({ total: 3, hasLiked: true });
  });

  it("gagal: tampilan dikembalikan ke keadaan server dan error dilaporkan", async () => {
    const onError = vi.fn();
    const send = vi.fn(async () => { await new Promise((r) => setTimeout(r, 20)); throw new Error("boom"); });
    const { result } = renderHook(() =>
      useOptimisticLike({ initial: { total: 3, hasLiked: false }, send, onError }));

    act(() => result.current.toggle());
    expect(result.current.likes).toEqual({ total: 4, hasLiked: true });

    await act(async () => { await new Promise((r) => setTimeout(r, 100)); });
    expect(result.current.likes).toEqual({ total: 3, hasLiked: false });
    expect(onError).toHaveBeenCalledTimes(1);

    // setelah gagal, tombol tetap bisa dipakai
    act(() => result.current.toggle());
    expect(result.current.likes).toEqual({ total: 4, hasLiked: true });
  });
});
