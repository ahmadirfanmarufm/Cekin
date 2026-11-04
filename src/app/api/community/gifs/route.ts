import { NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { fail } from "@/features/community/server/http";
import { GifProviderError, searchGifs } from "@/features/community/server/gif-provider";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const params = request.nextUrl.searchParams;
    const q = (params.get("q") ?? "").trim().slice(0, 50);
    const page = Math.min(Math.max(parseInt(params.get("page") ?? "1", 10) || 1, 1), 20);

    const data = await searchGifs({ q, page });

    return Response.json(
      { success: true, data },
      { headers: { "Cache-Control": "private, max-age=60" } },
    );
  } catch (error) {
    if (error instanceof GifProviderError) return fail(error.status, error.message);

    console.error("Community GIF search error:", error);
    return fail(500, "Gagal memuat GIF.");
  }
}
