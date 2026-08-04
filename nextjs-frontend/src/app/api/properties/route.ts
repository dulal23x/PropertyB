import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sourceUrl = new URL(request.url);
  const backendUrl = apiUrl(`/properties?${sourceUrl.searchParams.toString()}`);

  try {
    const response = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, page_size: 0 }, { status: 502 });
  }
}
