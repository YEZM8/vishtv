import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/write-client";

/**
 * Increments an article's all-time view counter. Called (fire-and-forget) from the article page.
 * Public endpoint — like any analytics beacon. Only accepts article document ids.
 */
export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !id.startsWith("article.")) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    await writeClient
      .patch(id)
      .setIfMissing({ viewCount: 0 })
      .inc({ viewCount: 1 })
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ ok: true });
  } catch {
    // Never surface tracking errors to the reader
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
